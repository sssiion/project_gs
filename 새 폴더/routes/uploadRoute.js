const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const uploadController = require('../controllers/uploadController');
router.post('/', upload.single('file'), uploadController.uploadExcel); //엑셀 업로드

module.exports = router;


