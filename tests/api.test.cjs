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
