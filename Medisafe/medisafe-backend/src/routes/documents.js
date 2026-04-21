const express = require('express');
const router = express.Router();
const controller = require('../controllers/documentController');

router.post('/upload-url', controller.getUploadUrl);
router.post('/', controller.saveDocument);
router.get('/', controller.getAll);
router.get('/:id/download-url', controller.getDownloadUrl);
router.delete('/:id', controller.remove);

module.exports = router;