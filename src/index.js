const express = require('express');
const database = require('./database');
const router = require('./router');
const bodyParser = require('body-parser');
const corsMiddleware = require('./middlewares/corsMiddleware');
const schemaValidationErrorMiddleware = require('./middlewares/schemaValidationErrorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(corsMiddleware);
app.use(router);
app.use(schemaValidationErrorMiddleware);

async function start() {
  await database.init();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Example app listening on port ${PORT}!`);
  });
  return app;
}

// For testing
module.exports = start();
