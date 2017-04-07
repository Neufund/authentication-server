const winston = require('winston');

module.exports = (err, req, res, next) => {
  let responseData;

  if (err.name === 'JsonSchemaValidation') {
    // logs "express-jsonschema: Invalid data found"
    winston.warning(err.message);

    // Set a bad request http response status or whatever you want
    res.status(400);

    // Format the response body however you want
    responseData = {
      statusText: 'Bad Request',
      jsonSchemaValidation: true,
      validations: err.validations,  // All of your validation information
    };

    res.json(responseData);
  } else {
    // pass error to next error middleware handler
    next(err);
  }
};

