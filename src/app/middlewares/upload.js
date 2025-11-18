const multer = require('multer');
const path = require('path');
const fsExtra = require('fs-extra');

function uploadTmp(tmpFolder) {
    const uploadPath = path.join(__dirname, '../public/uploads/tmp', tmpFolder);
    if (!fsExtra.existsSync(uploadPath)) fsExtra.mkdirpSync(uploadPath);

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadPath),
        filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
    });

    return multer({ storage }).single('image');
}

module.exports = uploadTmp;