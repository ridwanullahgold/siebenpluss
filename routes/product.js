const express = require('express');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

const {
  createData,
  readData,
  readCatData,
  countData,
  updateData,
  deleteData
} = require('../controllers/prod_controller');
const router = express.Router();
router
  .post('/', upload.single('avatar'), createData)
  .get('/', readData)
  .get('/:category', readCatData)
  .get('/count/:category', countData)
  .put('/:id', updateData)
  .delete('/:id', deleteData);


module.exports = router;
