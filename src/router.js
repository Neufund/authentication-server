const router = require('express').Router();
const usersRoute = require('./routes/users');

router.use('/users', usersRoute);

module.exports = router;
