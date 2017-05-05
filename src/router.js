const router = require('express').Router();
const apiRoute = require('./routes/api');

router.use('/api', apiRoute);

module.exports = router;
