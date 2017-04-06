const express = require('express');
const db = require('sqlite');
const statements = require('./db');
const router = require('./router');
const bodyParser = require('body-parser');
const corsMiddleware = require('./middlewares/corsMiddleware');
const schemaValidationErrorMiddleware = require('./middlewares/schemaValidationErrorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

async function main() {
  const verbose = true;
  await db.open(':memory:', { Promise, verbose });
  await db.migrate();
  await statements.init();

  app.use(bodyParser.json());
  app.use(corsMiddleware);
  app.use(router);
  app.use(schemaValidationErrorMiddleware);

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log('Example app listening on port 3000!');
  });
}

main();
