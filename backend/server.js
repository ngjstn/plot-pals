const express = require('express');
const app = express();
const profilesRouter = require('./routers/profilesRouter');
const updatesRouter = require('./routers/updatesRouter');
const gardensRouter = require('./routers/gardensRouter');
const postsAndtasksRouter = require('./routers/postsAndtasksRouter');
const rolesRouter = require('./routers/rolesRouter');
const adminProfilesRouter = require('./routers/adminProfilesRouter');
const errorHandler = require('./errorHandler');

// middleware to autoformat request to .json format
app.use(express.json());

// EXPLANATION NOTE: routes all path that starts with '/profiles'
app.use('/profiles', profilesRouter);
app.use('/adminProfiles', adminProfilesRouter);
app.use('/gardens', gardensRouter);
app.use('/updates', updatesRouter);
app.use('/posts', postsAndtasksRouter);
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
