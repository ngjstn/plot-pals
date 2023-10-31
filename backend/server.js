const express = require('express');
const app = express();
const profilesRouter = require('./routers/profilesRouter');
const updatesRouter = require('./routers/updatesRouter');
const gardensRouter = require('./routers/gardensRouter');
const tasksRouter = require('./routers/tasksRouter');
const devRouter = require('./routers/devRouter');
const rolesRouter = require('./routers/rolesRouter');
const adminProfilesRouter = require('./routers/adminProfilesRouter');
const errorHandler = require('./errorHandler');

// middleware to autoformat request to .json format
app.use(express.json());

app.use('/dev', devRouter);

app.use('/profiles', profilesRouter);
app.use('/adminProfiles', adminProfilesRouter);
app.use('/gardens', gardensRouter);
app.use('/updates', updatesRouter);
app.use('/tasks', tasksRouter);
app.use('/roles', rolesRouter);

app.get('/', (req, res) => {
  return res.json({ message: 'Plot Pals :)' });
});

// error handling
app.use(errorHandler);

const PORT = 8081;

// start server
app.listen(PORT, (req, res) => {
  console.log('Server running at port: %s', PORT);
});
