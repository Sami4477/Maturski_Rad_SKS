const Database = require('better-sqlite3');
const db = new Database('data.sqlite');
console.log('schedule_config:', db.prepare('SELECT * FROM schedule_config').get());
console.log('classes:', db.prepare('SELECT * FROM classes').all());
console.log('users:', db.prepare('SELECT id, username, role, class_id FROM users').all());
console.log('slots A count:', db.prepare("SELECT COUNT(*) AS c FROM schedule_slots WHERE class_id=1 AND week_type='A'").get().c);
console.log('slots B count:', db.prepare("SELECT COUNT(*) AS c FROM schedule_slots WHERE class_id=1 AND week_type='B'").get().c);
console.log('sample:', db.prepare('SELECT * FROM schedule_slots WHERE class_id=1 LIMIT 3').all());
db.close();
