const express = require('express')
const path = require('path')
const multer = require('multer')
const router = express.Router()
const auth = require('../app/middlewares/auth')
const authorize = require('../app/middlewares/authorize')

const adminController = require('../app/controllers/AdminController')

// Multer cấu hình thumbnail
const storageThumbnail = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads/tmp')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const uploadThumbnail = multer({ storage: storageThumbnail }).single('thumbnail')

// Routers
// /
router.get('/stored/news', auth, authorize('admin'), adminController.storedNews)
router.get('/trash/news', auth, authorize('admin'), adminController.trashNews)
router.delete('/:id', auth, authorize('admin'), adminController.destroy)
router.delete('/force/:id', auth, authorize('admin'), adminController.forceDestroy)
router.patch('/restore/:id', auth, authorize('admin'), adminController.restore)

// /posts
router.get('/posts/add-new', auth, authorize('admin'), adminController.create);
router.post('/posts/upload/tmp/:tmpFolder', auth, authorize('admin'), adminController.uploadTemp);
router.post('/posts/store', auth, authorize('admin'), uploadThumbnail, adminController.store);
router.post('/posts/clone/:id', auth, authorize('admin'), adminController.clone);
router.get('/posts/edit/:id', auth, authorize('admin'), adminController.edit);
router.put('/posts/:id', auth, authorize('admin'), uploadThumbnail, adminController.update);

module.exports = router