var _fix_schedule_DB = require('better-sqlite3');
var _fix_schedule_db = new _fix_schedule_DB('data.sqlite');

var _fix_schedule_classId = 1;
var _fix_schedule_bCount = _fix_schedule_db.prepare("SELECT COUNT(*) AS c FROM schedule_slots WHERE class_id = ? AND week_type = 'B'").get(_fix_schedule_classId).c;
if (_fix_schedule_bCount > 0) {
  console.log('Schedule B already exists for class', _fix_schedule_classId, 'with', _fix_schedule_bCount, 'slots.');
  _fix_schedule_db.close();
  process.exit(0);
}

var _fix_schedule_slotsA = _fix_schedule_db.prepare(
  `SELECT day_of_week, period_number, subject_id, teacher_id, room, start_time, end_time
   FROM schedule_slots
   WHERE class_id = ? AND week_type = 'A'
   ORDER BY day_of_week, period_number`
).all(_fix_schedule_classId);

var _fix_schedule_insert = _fix_schedule_db.prepare(
  `INSERT INTO schedule_slots (class_id, week_type, day_of_week, period_number, subject_id, teacher_id, room, start_time, end_time)
   VALUES (?, 'B', ?, ?, ?, ?, ?, ?, ?)`
);

var _fix_schedule_tx = _fix_schedule_db.transaction((rows) => {
  for (var _fix_schedule_row of rows) {
    _fix_schedule_insert.run(_fix_schedule_classId, _fix_schedule_row.day_of_week, _fix_schedule_row.period_number, _fix_schedule_row.subject_id, _fix_schedule_row.teacher_id, _fix_schedule_row.room, _fix_schedule_row.start_time, _fix_schedule_row.end_time);
  }
});

_fix_schedule_tx(_fix_schedule_slotsA);
console.log('Inserted', _fix_schedule_slotsA.length, 'B-week slots for class', _fix_schedule_classId);
_fix_schedule_db.close();
