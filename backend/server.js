const express = require('express');
const socket = require('socket.io');
const app = express();
const profilesRouter = require('./routers/profilesRouter');
const gardensRouter = require('./routers/gardensRouter');
const postsAndtasksRouter = require('./routers/postsAndtasksRouter');
const rolesRouter = require('./routers/rolesRouter');
const adminProfilesRouter = require('./routers/adminProfilesRouter');
const plotsRouter = require('./routers/plotsRouter');
const errorHandler = require('./errorHandler');

// middleware to autoformat request to .json format
app.use(express.json());

// EXPLANATION NOTE: routes all path that starts with '/profiles'
app.use('/profiles', profilesRouter);
app.use('/adminProfiles', adminProfilesRouter);
app.use('/gardens', gardensRouter);
app.use('/posts', postsAndtasksRouter);
app.use('/roles', rolesRouter);
app.use('/plots', plotsRouter);

// error handling
app.use(errorHandler);

const PORT = 8081;

// start server
let server;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, (req, res) => {
    console.log('Server running at port: %s', PORT);
  });
}

const io = socket(server);

io.on('connection', (socket) => {
  console.log('New socket connection: ' + socket.id);

  socket.on('New Task', (idOfGardenWithNewTask) => {
    console.log(idOfGardenWithNewTask);
    io.emit('New Task', idOfGardenWithNewTask);
  });
});

module.exports = { app };
