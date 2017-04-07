const express = require('express');
const winston = require('winston');
const database = require('./database');
const router = require('./router');
const bodyParser = require('body-parser');
const corsMiddleware = require('./middlewares/corsMiddleware');
const schemaValidationErrorMiddleware = require('./middlewares/schemaValidationErrorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

winston.setLevels(winston.config.syslog.levels);
winston.level = process.env.LOG_LEVEL || 'warning';

app.use(bodyParser.json());
app.use(corsMiddleware);
app.use(router);
app.use(schemaValidationErrorMiddleware);

async function start() {
  await database.init();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    winston.info(`Example app listening on port ${PORT}!`);
  });
  return app;
}

// For testing
module.exports = start();
