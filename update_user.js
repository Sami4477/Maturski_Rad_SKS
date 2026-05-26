var DB = require('better-sqlite3');
var db = new DB('data.sqlite');

// Check what class_id=4 is or create it if needed
var cls = db.prepare('SELECT * FROM classes WHERE id = 4').get();
if (!cls) {
  // Class 4 doesn't exist, let's see all classes
  console.log('Available classes:');
  var allClasses = db.prepare('SELECT * FROM classes').all();
  allClasses.forEach(c => console.log('ID:', c.id, 'Name:', c.name));
  
  // Assume user means class 4-6 (ID=1)
  console.log('\nUpdating student7a -> ucenik_IV-6, keeping class_id=1 (4-6)');
  db.prepare("UPDATE users SET username='ucenik_IV-6' WHERE username='student7a'").run();
  console.log('Done');
} else {
  console.log('Class 4 found:', cls.name);
  console.log('Updating student7a -> ucenik_IV-6, setting class_id=4');
  db.prepare("UPDATE users SET username='ucenik_IV-6', class_id=4 WHERE username='student7a'").run();
  console.log('Done');
}

var updated = db.prepare("SELECT id, username, class_id FROM users WHERE username='ucenik_IV-6'").get();
console.log('\nUpdated user:', updated);

db.close();
