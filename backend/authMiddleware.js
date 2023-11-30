const { OAuth2Client } = require('google-auth-library');
const { StatusCodes } = require('http-status-codes');
const crypto = require('crypto');
require('dotenv').config();

// middleware to authenticate user and set req.userId given authorization header
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token;
    // get token
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7, authHeader.length);
      if (
        Buffer.byteLength(token) === Buffer.byteLength(process.env.BYPASS_TOKEN) &&
        crypto.timingSafeEqual(Buffer.from(token), Buffer.from(process.env.BYPASS_TOKEN))
      ) {
        req.userId = process.env.BYPASS_TOKEN;
        return next();
      }
    } else {
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
