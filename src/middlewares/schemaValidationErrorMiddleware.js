const winston = require('winston');

module.exports = (err, req, res, next) => {
  if (err.name === 'JsonSchemaValidation') {
    // Logs "express-jsonschema: Invalid data found"
    winston.warning(err.message);

    // Reply with error
    res.status(400);
    res.json({
      statusText: 'Bad Request',
      jsonSchemaValidation: true,
      validations: err.validations,
    });
  } else {
    // pass error to next error middleware handler
    next(err);
  }
};
