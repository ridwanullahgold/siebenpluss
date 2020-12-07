const express = require('express');
const {
  verifyToken
} = require('../controllers/auth_controller');

const {
  createData,
  readData,
} = require('../controllers/cat_controller');
const router = express.Router();
router
  .post('/', verifyToken, createData)
  .get('/', readData)

module.exports = router;
