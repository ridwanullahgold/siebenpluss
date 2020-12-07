const express = require('express');

const {
    loginData,
    signUp,
    resetPassword,
    forgotPassword,
    updatePassword,
    verifyToken,
    confirmEmail
} = require('../controllers/auth_controller');
const router = express.Router();
router
  .post('/', loginData)
  .post('/register', signUp)
  .post('/forgot', forgotPassword)
  .patch('/reset/:token', resetPassword)
  .patch('/confirm/:token', confirmEmail)
  .patch('/updatePassword', verifyToken, updatePassword)

module.exports = router;
