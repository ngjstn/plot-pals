const { OAuth2Client } = require('google-auth-library');
const express = require('express');
const app = express();

// middleware to autoformat request to .json format
app.use(express.json());

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
    const userid = payload['sub'];

    // userid is now accessible through req object
    req.userid = userid;
    console.log('User ID: ' + req.userid);

    return next();
  } catch (error) {
    const invalidAuthorizationHeader = new Error('No valid authorization header');
    return res.status(403).json({ error: invalidAuthorizationHeader });
  }
});

app.get('/', (req, res) => {
  return res.json({ message: 'Plot Pals :)' });
});

const PORT = 8081;
// start server
const server = app.listen(PORT, (req, res) => {
  console.log('Server running at port: %s', PORT);
});
