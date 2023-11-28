const { OAuth2Client, auth } = require('google-auth-library');
const { StatusCodes } = require('http-status-codes');
require('dotenv').config();

// middleware to authenticate user
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    let token;
    // get token
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7, authHeader.length);
      if (token === process.env.BYPASS_TOKEN) {
        req.userId = process.env.BYPASS_TOKEN;
        return next();
      }
    } else {
      console.log('foo');
      const invalidAuthorizationHeader = new Error('No valid authorization header');
      invalidAuthorizationHeader.status = StatusCodes.FORBIDDEN;
      return next(invalidAuthorizationHeader);
    }
    const client = new OAuth2Client();
    const serverClientId = process.env.GOOGLE_SERVER_CLIENT_ID;

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
    console.log(error);
    // EXPLANATION NOTE: we create a custom error object here rather than using an error
    // object caught by the try/catch block
    const invalidAuthorizationHeader = new Error('No valid authorization header');
    invalidAuthorizationHeader.status = StatusCodes.FORBIDDEN;
    return next(invalidAuthorizationHeader);
  }
};

module.exports = authMiddleware;
