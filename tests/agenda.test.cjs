const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},
}).outputText,filename);
const {dateKey,parseDateKey,scheduleFor,isScheduledOn,calendarDays,monthCounts,initialScheduleDate}=require('../src/features/agenda/dates.ts');

test('a one-time future task appears only on its chosen date and never repeats next week',()=>{
 const schedule={...scheduleFor('2026-11-05','once'),active:true,dayPeriod:'MORNING'};
 assert.equal(schedule.startDate,'2026-11-05');assert.equal(schedule.endDate,'2026-11-05');
 assert.deepEqual(schedule.scheduledDays,['THURSDAY']);
 for(const day of ['2026-11-04','2026-11-06','2026-11-12'])assert.equal(isScheduledOn(schedule,day),false);
 assert.equal(isScheduledOn(schedule,'2026-11-05'),true);
});

test('daily and weekly recurrence start on the selected date without changing older tasks',()=>{
 const daily={...scheduleFor('2026-12-31','daily'),active:true,dayPeriod:'ANYTIME'};
 const weekly={...scheduleFor('2026-12-31','weekly'),active:true,dayPeriod:'ANYTIME'};
 assert.equal(isScheduledOn(daily,'2026-12-30'),false);assert.equal(isScheduledOn(daily,'2027-01-01'),true);
 assert.equal(isScheduledOn(weekly,'2027-01-01'),false);assert.equal(isScheduledOn(weekly,'2027-01-07'),true);
 assert.equal(isScheduledOn({...weekly,active:false},'2027-01-07'),false);
});

test('the Monday-first grid includes leap day and navigates year boundaries with local dates',()=>{
 const days=calendarDays(parseDateKey('2024-02-01'));
 assert.equal(days.length,42);assert.equal(parseDateKey(days[0].date).getDay(),1);
 assert.equal(days.filter(day=>day.inMonth).length,29);
 assert.ok(days.some(day=>day.date==='2024-02-29'&&day.inMonth));
 assert.equal(dateKey(parseDateKey('2026-12-31')),'2026-12-31');
 for(const invalid of ['2026-02-29','2026-13-01','2026-04-31','2026-2-01','not-a-date'])assert.throws(()=>parseDateKey(invalid));
});

test('month badges count separate turns and respect end dates and inactive tasks',()=>{
 const task={...scheduleFor('2026-11-05','once'),active:true,dayPeriod:'MORNING',dayPeriods:['MORNING','EVENING']};
 const counts=monthCounts([task,{...task,active:false}],parseDateKey('2026-11-01'));
 assert.equal(counts['2026-11-05'],2);assert.equal(counts['2026-11-12'],0);
 assert.equal(Object.keys(counts).length,30);
});

test('links from the agenda preselect valid future dates and reject malformed or past values',()=>{
 assert.equal(initialScheduleDate('2026-11-05','2026-10-20'),'2026-11-05');
 for(const value of ['2026-10-19','2026-02-30',undefined,['2026-11-05']])
  assert.equal(initialScheduleDate(value,'2026-10-20'),'2026-10-20');
});

test('the demo saves a future task without adding it to today and supports independent turns',async()=>{
 delete process.env.EXPO_PUBLIC_API_URL;
 const api=require('../src/services/api/today-api.ts');
 const today=dateKey();const date=parseDateKey(today);date.setDate(date.getDate()+40);const future=dateKey(date);
 await api.createHabit({areaId:'demo-study',name:'Tarefa futura de teste',measurementType:'COUNT',targetValue:1,
  dayPeriod:'MORNING',dayPeriods:['MORNING','EVENING'],...scheduleFor(future,'once')});
 assert.equal((await api.getTodaySummary()).activities.some(item=>item.title==='Tarefa futura de teste'),false);
 let items=(await api.getAgendaDay(future)).activities.filter(item=>item.title==='Tarefa futura de teste');
 assert.equal(items.length,2);assert.notEqual(items[0].id,items[1].id);
 const schedules=await api.getScheduledHabits();
 assert.equal(schedules.find(item=>item.name==='Tarefa futura de teste').endDate,future);
 const nextWeek=parseDateKey(future);nextWeek.setDate(nextWeek.getDate()+7);
 assert.equal((await api.getAgendaDay(dateKey(nextWeek))).activities.some(item=>item.title==='Tarefa futura de teste'),false);
 await api.deleteHabit(items[0].habitId,'MORNING');
 items=(await api.getAgendaDay(future)).activities.filter(item=>item.title==='Tarefa futura de teste');
 assert.equal(items.length,1);assert.equal(items[0].completionPeriod,'EVENING');
});

test('canceling one period changes only that date count and restoring brings it back',()=>{
 const date='2026-11-05';const schedule={...scheduleFor(date,'weekly'),active:true,dayPeriod:'MORNING',dayPeriods:['MORNING','EVENING'],canceledOccurrences:[`${date}:MORNING`]};
 assert.equal(monthCounts([schedule],parseDateKey(date))[date],1);
 assert.equal(monthCounts([schedule],parseDateKey(date))['2026-11-12'],2);
 assert.equal(monthCounts([{...schedule,canceledOccurrences:[]}],parseDateKey(date))[date],2);
});
test('demo day cancellation persists across reads, preserves recurrence and supports undo',async()=>{
 delete process.env.EXPO_PUBLIC_API_URL;
 const api=require('../src/services/api/today-api.ts');
 const task=await api.createHabit({areaId:'demo-study',name:'Cancelar um dia',measurementType:'COUNT',targetValue:1,dayPeriod:'MORNING',...scheduleFor('2026-11-05','weekly')});
 const id=(await api.getAgendaDay('2026-11-05')).activities.find(a=>a.title==='Cancelar um dia').habitId;
 await api.setAgendaOccurrenceCanceled(id,'2026-11-05','MORNING',true);
 assert.equal((await api.getAgendaDay('2026-11-05')).activities.some(a=>a.habitId===id),false);
 assert.equal((await api.getAgendaDay('2026-11-12')).activities.some(a=>a.habitId===id),true);
 await api.setAgendaOccurrenceCanceled(id,'2026-11-05','MORNING',false);
 assert.equal((await api.getAgendaDay('2026-11-05')).activities.some(a=>a.habitId===id),true);
});
