const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const app = express();

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Load schedules
let schedules = {};
const schedulesPath = path.join(__dirname, 'schedules.json');
if (fs.existsSync(schedulesPath)) {
    schedules = JSON.parse(fs.readFileSync(schedulesPath, 'utf8'));
}

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'nikisupergamer@obala' && password === 'niki123') {
        req.session.user = { email };
        res.redirect('/admin');
    } else {
        res.send('Invalid credentials');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/');
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/grade:num.html', (req, res) => {
    res.sendFile(path.join(__dirname, `grade${req.params.num}.html`));
});

app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.post('/add-full-schedule', requireAuth, (req, res) => {
  console.log('Received request to add full schedule:', JSON.stringify(req.body, null, 2));
  const { classId, schedule } = req.body;

  if (!classId || !schedule) {
      return res.status(400).json({ success: false, error: 'Class ID and schedule are required.' });
  }

  try {
      if (typeof schedule !== 'object' || Array.isArray(schedule)) {
          throw new Error('Schedule must be an object');
      }

      if (!schedules[classId]) {
          schedules[classId] = {};
      }

      // Add schedule for each day
      Object.keys(schedule).forEach(day => {
          if (!Array.isArray(schedule[day])) {
              throw new Error(`Schedule for ${day} must be an array`);
          }
          schedules[classId][day] = schedule[day];
      });

      // Save updated schedules to file
      fs.writeFileSync(schedulesPath, JSON.stringify(schedules, null, 2));
      console.log('Schedule saved successfully');
      res.json({ success: true });
  } catch (error) {
      console.error('Error saving schedule:', error);
      res.status(500).json({ success: false, error: 'An error occurred while saving the schedule: ' + error.message });
  }
});

app.get('/debug-schedules', requireAuth, (req, res) => {
  res.json(schedules);
});


app.get('/secret', (req, res) => {
  res.sendFile(path.join(__dirname, 'secret.html'));
});

app.get('/schedule/:class', (req, res) => {
    const classId = req.params.class;
    const schedule = schedules[classId];

    if (schedule) {
        res.json(schedule);
    } else {
        res.status(404).json({ error: 'Raspored nije pronađen za odabrani razred' });
    }
});

app.get('/logo', (req, res) => {
    res.json({ logo: config.logo });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(config.port, () => {
    console.log(`Server je pokrenut na ${config.url}:${config.port}`);
});