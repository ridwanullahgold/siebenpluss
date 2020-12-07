const express = require('express');

const {
  createData,
  readData,
} = require('../controllers/order_controller');
const {
  verifyToken,
  restrictTo
} = require('../controllers/auth_controller');
const router = express.Router();
router
  .post('/', createData)
  .get('/', verifyToken, restrictTo('Admin'), readData)

module.exports = router;
