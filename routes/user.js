const express = require('express');

const {
  createData,
  readData,
  updateData,
  deleteData,
  updateMe,
  updateProfile
} = require('../controllers/user_controller');

const {
  verifyToken
} = require('../controllers/auth_controller');

const router = express.Router();

router
  .patch('/updateMe', verifyToken, updateMe)
  .patch('/profile', verifyToken, updateProfile)
  .post('/', createData)
  .get('/', verifyToken, readData)
  .put('/:id', updateData)
  .delete('/:id', deleteData);

module.exports = router;
