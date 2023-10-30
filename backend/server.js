const express = require('express');
const app = express();
const profilesRouter = require('./routers/profilesRouter');
const updatesRouter = require('./routers/updatesRouter');
const gardensRouter = require('./routers/gardensRouter');
const tasksRouter = require('./routers/tasksRouter');
const devRouter = require('./routers/devRouter');
const rolesRouter = require('./routers/rolesRouter');
const errorHandler = require('./errorHandler');

// middleware to autoformat request to .json format
app.use(express.json());

app.use('/dev', devRouter);

// middleware to authenticate user
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;

  // get token
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7, authHeader.length);
  } else {
    const invalidAuthorizationHeader = new Error('No valid authorization header');
    return res.status(403).json({ error: invalidAuthorizationHeader });
  }

  const client = new OAuth2Client();
  const serverClientId = '188221629259-675olt1lscjefjkllj14cuo801r5eoqv.apps.googleusercontent.com';

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: serverClientId,
    });
    const payload = ticket.getPayload();
    const userId = payload['sub'];

    // userid is now accessible through req object
    req.userId = userId;
    console.log('User ID: ' + req.userId);

    return next();
  } catch (error) {
    // EXPLANATION NOTE: we create a custom error object here rather than using an error
    // object caught by the try/catch block
    const invalidAuthorizationHeader = new Error('No valid authorization header');
    invalidAuthorizationHeader.status = StatusCodes.FORBIDDEN;
    next(invalidAuthorizationHeader);
  }
});

// EXPLANATION NOTE: routes all path that starts with '/profiles'
app.use('/profiles', profilesRouter);

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
