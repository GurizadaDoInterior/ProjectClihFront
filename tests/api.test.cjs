const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
// Compile the production API modules without loading the React Native runtime.
require.extensions['.ts'] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    filename,
  );
process.env.EXPO_PUBLIC_API_URL = 'http://localhost:8080/api/v1/';
const {
  request,
  ApiError,
  apiUrl,
  setAccessTokenProvider,
} = require('../src/services/api/client.ts');
const { mapToday } = require('../src/services/api/today-mapper.ts');
const {
  completeHabit,
  createHabit,
  createArea,
  getTodaySummary,
} = require('../src/services/api/today-api.ts');
const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
  setAccessTokenProvider();
});
const area = {
  id: 'a',
  name: 'Música',
  slug: 'musica',
  color: '#123456',
  icon: 'music',
  position: 0,
};
const today = {
  date: '2026-09-19',
  displayName: 'Tiago',
  progress: {
    totalXp: 150,
    level: 2,
    xpForCurrentLevel: 100,
    xpForNextLevel: 300,
    currentStreak: 3,
    longestStreak: 5,
  },
  summary: { planned: 1, completed: 0, progressPercentage: 0 },
  week: [
    { date: '2026-09-18', label: 'SEX', status: 'COMPLETE', current: false, completed: 2 },
    { date: '2026-09-19', label: 'SÁB', status: 'PENDING', current: true, completed: 0 },
    { date: '2026-09-20', label: 'DOM', status: 'FUTURE', current: false, completed: 0 },
  ],
  areaProgress: [{ area, planned: 1, completed: 0, progressPercentage: 0 }],
  habits: [
    {
      id: 'h',
      name: 'Praticar violão',
      area,
      measurementType: 'MINUTES',
      targetValue: 30,
      unit: 'minutos',
      dayPeriod: 'EVENING',
      completed: false,
    },
  ],
};
test('maps nested Java DTOs, custom areas, periods, week and XP relative to current level', () => {
  const result = mapToday(today);
  assert.equal(result.xp, 150);
  assert.equal(result.xpInLevel, 50);
  assert.equal(result.xpToNextLevel, 200);
  assert.equal(result.longestStreak, 5);
  assert.deepEqual(
    result.week.map((day) => day.state),
    ['complete', 'current', 'empty'],
  );
  assert.equal(result.activities[0].areaName, 'Música');
  assert.equal(result.activities[0].period, 'EVENING');
  assert.equal(result.activities[0].target, '30 minutos');
  assert.equal(result.areas[0].color, '#123456');
});
test('handles empty routine and boolean goals without inventing rewards', () => {
  assert.deepEqual(mapToday({ ...today, habits: [], areaProgress: [] }).activities, []);
  assert.equal(
    mapToday({ ...today, habits: [{ ...today.habits[0], measurementType: 'BOOLEAN' }] })
      .activities[0].target,
    'Concluir uma vez',
  );
});
test('normalizes URL and sends bearer token through the API client', async () => {
  assert.equal(apiUrl, 'http://localhost:8080/api/v1');
  setAccessTokenProvider(async () => 'test-token');
  global.fetch = async (url, init) => {
    assert.equal(url, 'http://localhost:8080/api/v1/today');
    assert.equal(init.headers.Authorization, 'Bearer test-token');
    return Response.json(today);
  };
  assert.equal((await getTodaySummary()).displayName, 'Tiago');
});
test('completion retries use the same idempotency key and timestamp', async () => {
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, init });
    if (calls.length === 1) throw new TypeError('connection lost after write');
    return Response.json({ id: 'completion' });
  };
  await completeHabit('habit-id');
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'http://localhost:8080/api/v1/habits/habit-id/completions');
  assert.equal(calls[0].init.headers['Idempotency-Key'], calls[1].init.headers['Idempotency-Key']);
  assert.equal(calls[0].init.body, calls[1].init.body);
  assert.ok(JSON.parse(calls[0].init.body).completedAt);
  assert.equal(JSON.parse(calls[0].init.body).xp, undefined);
});
test('validation failures are not retried or reported as successful', async () => {
  let calls = 0;
  global.fetch = async () => {
    calls++;
    return Response.json(
      { code: 'HABIT_NOT_SCHEDULED', message: 'Atividade fora do dia' },
      { status: 422 },
    );
  };
  await assert.rejects(completeHabit('h'), (error) => error.code === 'HABIT_NOT_SCHEDULED');
  assert.equal(calls, 1);
});
test('authentication failures are surfaced without retry', async () => {
  let calls = 0;
  global.fetch = async () => {
    calls++;
    return new Response('', { status: 401 });
  };
  await assert.rejects(completeHabit('h'), (error) => error.status === 401);
  assert.equal(calls, 1);
});
test('already completed responses reconcile by refreshing the server state', async () => {
  global.fetch = async () => Response.json({ code: 'HABIT_ALREADY_COMPLETED' }, { status: 409 });
  await completeHabit('h');
});
test('network failures remain errors after bounded retries', async () => {
  let calls = 0;
  global.fetch = async () => {
    calls++;
    throw new TypeError('offline');
  };
  await assert.rejects(
    completeHabit('h'),
    (error) => error instanceof ApiError && error.status === 0,
  );
  assert.equal(calls, 2);
});
test('area and habit writes send the Java API fields', async () => {
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return Response.json(area, { status: 201 });
  };
  await createArea('Música');
  const habit = {
    areaId: 'a',
    name: 'Praticar violão',
    measurementType: 'MINUTES',
    targetValue: 30,
    unit: 'minutos',
    dayPeriod: 'EVENING',
    scheduledDays: ['SATURDAY'],
  };
  await createHabit(habit);
  assert.equal(calls[0].url, 'http://localhost:8080/api/v1/areas');
  assert.deepEqual(calls[0].body, { name: 'Música', color: '#2F63EE', icon: 'book' });
  assert.equal(calls[1].url, 'http://localhost:8080/api/v1/habits');
  assert.deepEqual(calls[1].body, habit);
});
test('204 responses and plain-text server errors are handled', async () => {
  global.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await request('/areas/a', { method: 'DELETE' }), undefined);
  global.fetch = async () => new Response('unavailable', { status: 503 });
  await assert.rejects(request('/today'), (error) => error.status === 503);
});

test('profile PATCH leaves an unset username unchanged and sends the selected timezone', async () => {
  const { updateMe } = require('../src/services/api/today-api.ts');
  global.fetch = async (url, init) => {
    assert.equal(url, 'http://localhost:8080/api/v1/me');
    assert.equal(init.method, 'PATCH');
    const body = JSON.parse(init.body);
    assert.equal(Object.hasOwn(body, 'username'), false);
    assert.equal(body.timezoneId, 'America/Asuncion');
    assert.equal(body.completeOnboarding, true);
    return Response.json({ id: 'u', ...body, username: null });
  };
  const result = await updateMe({ displayName: 'Pessoa', username: undefined, timezoneId: 'America/Asuncion', completeOnboarding: true });
  assert.equal(result.username, null);
});

test('completed habits preserve the completion ID and awarded XP for immediate cancellation feedback', () => {
  const response = { ...today, habits: [{ ...today.habits[0], completed: true, completionId: 'c1', xpAwarded: 25 }] };
  assert.equal(mapToday(response).activities[0].completionId, 'c1');
  assert.equal(mapToday(response).activities[0].xpAwarded, 25);
});
test('undo calls the completion DELETE endpoint and accepts an empty response', async () => {
  const { undoHabit } = require('../src/services/api/today-api.ts');
  global.fetch = async (url, init) => {
    assert.equal(url, 'http://localhost:8080/api/v1/habits/h/completions/c1');
    assert.equal(init.method, 'DELETE');
    return new Response(null, { status: 204 });
  };
  await undoHabit('h', 'c1');
});
test('undo without a completion ID fails without sending a request', async () => {
  const { undoHabit } = require('../src/services/api/today-api.ts');
  global.fetch = async () => assert.fail('must not call server');
  await assert.rejects(undoHabit('h'), /identificar a conclusão/);
});
test('undo surfaces server failures so the UI can restore the previous state', async () => {
  const { undoHabit } = require('../src/services/api/today-api.ts');
  global.fetch = async () => Response.json({ message: 'Falha ao cancelar' }, { status: 500 });
  await assert.rejects(undoHabit('h', 'c1'), /Falha ao cancelar/);
});

test('profile photo upload and removal use authenticated account endpoints', async () => {
  const { uploadProfilePhoto, removeProfilePhoto } = require('../src/services/api/today-api.ts');
  setAccessTokenProvider(async () => 'test-token');
  const calls = [];
  global.fetch = async (url, init) => { calls.push({url,init}); return new Response(JSON.stringify({ id: 'me', avatarUrl: null }), { status: 200 }); };
  await uploadProfilePhoto('data:image/jpeg;base64,test');
  await removeProfilePhoto();
  assert.equal(calls[0].url, apiUrl + '/me/avatar');
  assert.equal(calls[0].init.method, 'PUT');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer test-token');
  assert.deepEqual(JSON.parse(calls[0].init.body), { image: 'data:image/jpeg;base64,test' });
  assert.equal(calls[1].init.method, 'DELETE');
});

test('first activity creates its typed area when the account has no areas', async () => {
  const { resolveHabitArea } = require('../src/services/api/today-api.ts');
  const calls=[];
  global.fetch=async (url, options) => {
    calls.push({url,body:JSON.parse(options.body)});
    return Response.json({id:'new-area',name:'Saúde'});
  };
  assert.equal(await resolveHabitArea('', ' Saúde ', []),'new-area');
  assert.equal(calls.length,1);
  assert.equal(calls[0].body.name,'Saúde');
});

test('area selection reuses existing areas without duplicate requests', async () => {
  const { resolveHabitArea } = require('../src/services/api/today-api.ts');
  global.fetch=async ()=>{throw new Error('Unexpected request');};
  assert.equal(await resolveHabitArea('', ' música ', [area]),'a');
  assert.equal(await resolveHabitArea('selected', '', [area]),'selected');
  assert.equal(await resolveHabitArea('', '', [area]),'a');
});

test('missing first area returns actionable feedback without sending a request', async () => {
  const { resolveHabitArea } = require('../src/services/api/today-api.ts');
  global.fetch=async ()=>{throw new Error('Unexpected request');};
  await assert.rejects(resolveHabitArea('', '', []),/Digite o nome de uma área/);
});

test('multiple periods remain one activity with a shared completion and hours target', () => {
  const response={...today, habits:[{...today.habits[0], measurementType:'HOURS', targetValue:1.5, unit:'horas', dayPeriods:['MORNING','EVENING'],completed:true,completionId:'shared',xpAwarded:10}]};
  const result=mapToday(response);
  assert.equal(result.activities.length,1);
  assert.deepEqual(result.activities[0].periods,['MORNING','EVENING']);
  assert.equal(result.activities[0].completionId,'shared');
  assert.equal(result.activities[0].target,'1.5 horas');
  assert.deepEqual(mapToday(today).activities[0].periods,[today.habits[0].dayPeriod]);
});

test('deleting an activity calls the authenticated archive endpoint', async () => {
  const {deleteHabit}=require('../src/services/api/today-api.ts');
  let calls=0;
  global.fetch=async (url,options)=>{calls++;assert.equal(url,apiUrl+'/habits/h1');assert.equal(options.method,'DELETE');return new Response(null,{status:204});};
  await deleteHabit('h1');assert.equal(calls,1);
});

test('hours and selected periods are sent together for one habit',async()=>{
  let calls=0;
  global.fetch=async (url,options)=>{calls++;const body=JSON.parse(options.body);assert.equal(body.measurementType,'HOURS');assert.equal(body.targetValue,1.5);assert.deepEqual(body.dayPeriods,['MORNING','EVENING']);return Response.json({id:'single'});};
  await createHabit({areaId:'a',name:'Estudar',measurementType:'HOURS',targetValue:1.5,unit:'horas',dayPeriod:'MORNING',dayPeriods:['MORNING','EVENING'],scheduledDays:['MONDAY']});
  assert.equal(calls,1);
});

test('area deletion accepts an empty response and encodes the identifier', async () => {
  const { deleteArea } = require('../src/services/api/today-api.ts');
  global.fetch = async (url, options) => {
    assert.equal(url, apiUrl + '/areas/area%2Fid');
    assert.equal(options.method, 'DELETE');
    return new Response(null, {status:204});
  };
  await deleteArea('area/id');
});

test('area deletion preserves server feedback for linked activities', async () => {
  const { deleteArea } = require('../src/services/api/today-api.ts');
  global.fetch = async () => Response.json({message:'Remova as atividades desta área primeiro.'}, {status:409});
  await assert.rejects(deleteArea('linked'), /Remova as atividades/);
});
test('separate periods keep separate row and completion identities', () => {
  const rows = mapToday({ ...today, habits: [
    { ...today.habits[0], dayPeriod: 'MORNING', dayPeriods:['MORNING'], completionPeriod:'MORNING', completed:true,completionId:'cm' },
    { ...today.habits[0], dayPeriod: 'EVENING', dayPeriods:['EVENING'], completionPeriod:'EVENING', completed:false,completionId:null },
  ] }).activities;
  assert.notEqual(rows[0].id,rows[1].id);
  assert.equal(rows[0].habitId, rows[1].habitId);
  assert.equal(rows[0].completed,true);
  assert.equal(rows[1].completed,false);
});
test('completion sends the selected period to the original habit endpoint', async () => {
  global.fetch=async(url,init) => {
    assert.equal(url,'http://localhost:8080/api/v1/habits/h/completions');
    assert.equal(JSON.parse(init.body).dayPeriod,'EVENING');
    return Response.json({id:'ce',xpAwarded:10});
  };
  await completeHabit('h','EVENING');
});
test('deleting a period targets only that period on the original habit', async () => {
  const {deleteHabit}=require('../src/services/api/today-api.ts');
  global.fetch=async(url,init) => {
    assert.equal(url,'http://localhost:8080/api/v1/habits/h?dayPeriod=MORNING');
    assert.equal(init.method,'DELETE');
    return new Response(null,{status:204});
  };
  await deleteHabit('h','MORNING');
});
test('area deletion checks linked habits across the full schedule, not only today', async () => {
  const {getAreaHabits}=require('../src/services/api/today-api.ts');
  global.fetch=async(url) => {
    assert.equal(url,'http://localhost:8080/api/v1/habits');
    return Response.json([
      {id:'other-day',areaId:'study',name:'Estudar',active:true,scheduledDays:['MONDAY'],dayPeriod:'EVENING'},
      {id:'inactive',areaId:'study',name:'Antiga',active:false,scheduledDays:['MONDAY']},
      {id:'another-area',areaId:'health',name:'Caminhar',active:true,scheduledDays:['MONDAY']},
    ]);
  };
  assert.deepEqual((await getAreaHabits('study')).map(h=>h.id),['other-day']);
});
