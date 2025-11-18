const express = require('express')
const router = express.Router()

const newsController = require('../app/controllers/NewsController')

router.get('/', newsController.list)
router.get('/:slug', newsController.show)

module.exports = router;
