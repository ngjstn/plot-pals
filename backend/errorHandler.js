const { StatusCodes } = require('http-status-codes');

// EXPLANATION NOTE: this is a general error handling function that you can use by calling next(err) where
// err is an error object caught by a try/catch block or an error object that you created on your own
const errorHandler = (error, request, response, next) => {
  console.log(error);
  const status = error.status || StatusCodes.INTERNAL_SERVER_ERROR;
  response.status(status).json({ error: error.message });
};

module.exports = errorHandler;
