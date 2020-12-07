const express = require('express');
const {
  verifyToken
} = require('../controllers/auth_controller');
const {
  createData,
  readData,
  readDataByUser,
  updateData
} = require('../controllers/job_controller');
const router = express.Router();
router
  .post('/', verifyToken, createData)
  .put('/:id', verifyToken, updateData)
  .get('/', verifyToken, readData)
  .get('/user', verifyToken, readDataByUser)

module.exports = router;
