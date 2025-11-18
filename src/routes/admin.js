const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const adminController = require('../app/controllers/AdminController');
const adminSession = require('../app/middlewares/adminSession');

// Multer config
const storageThumbnail = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads/tmp')),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const uploadThumbnail = multer({ storage: storageThumbnail }).single('thumbnail');

// /
router.get('/stored/news', adminSession, adminController.storedNews);
router.get('/trash/news', adminSession, adminController.trashNews);

router.delete('/:id', adminSession, adminController.destroy);
router.delete('/force/:id', adminSession, adminController.forceDestroy);
router.patch('/restore/:id', adminSession, adminController.restore);

// /posts
router.get('/posts/add-new', adminSession, adminController.create);
router.post('/posts/upload/tmp/:tmpFolder', adminSession, adminController.uploadTemp);
router.post('/posts/store', adminSession, uploadThumbnail, adminController.store);
router.post('/posts/clone/:id', adminSession, adminController.clone);
router.get('/posts/edit/:id', adminSession, adminController.edit);
router.put('/posts/:id', adminSession, uploadThumbnail, adminController.update);

module.exports = router;
