const express = require('express')
const path = require('path');
const multer = require('multer');
const router = express.Router()

const adminController = require('../app/controllers/AdminController')

// Multer cấu hình thumbnail
const storageThumbnail = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads/tmp')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const uploadThumbnail = multer({ storage: storageThumbnail }).single('thumbnail');

// Routers
// /
router.get('/stored/news', adminController.storedNews)
router.get('/trash/news', adminController.trashNews)
router.delete('/:id', adminController.destroy)
router.delete('/force/:id', adminController.forceDestroy)
router.patch('/restore/:id', adminController.restore)

// /posts
router.get('/posts/add-new', adminController.create)
router.post('/posts/upload/tmp/:tmpFolder', adminController.uploadTemp)
router.post('/posts/store', uploadThumbnail, adminController.store)
router.post('/posts/clone/:id', adminController.clone)
router.get('/posts/edit/:id', adminController.edit)
router.put('/posts/:id', uploadThumbnail, adminController.update)

module.exports = router