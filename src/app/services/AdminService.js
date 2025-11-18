const Newdb = require('../models/News');
const path = require('path');
const fsExtra = require('fs-extra');
const multer = require('multer');

class AdminService {

    // Lấy danh sách bài viết + số bài đã xoá
    getStoredNews() {
        return Promise.all([
            Newdb.find({}),
            Newdb.countDocumentsDeleted()
        ]);
    }

    // Lấy danh sách bài đã xoá
    getTrashNews() {
        return Newdb.findDeleted({});
    }

    // Lưu bài viết mới
    createNews(formData, file) {
        const newdb = new Newdb({ ...formData });

        return newdb.save()
        .then(newdb => {
            const idFolder = newdb._id.toString();
            const uploadFolder = path.join(__dirname, '../../public/uploads', idFolder);
            fsExtra.ensureDirSync(uploadFolder);

            // thumbnail
            if (file) {
                const thumbSrc = file.path;
                const thumbDest = path.join(uploadFolder, file.filename);

                fsExtra.moveSync(thumbSrc, thumbDest, { overwrite: true });

                newdb.thumbnail = `/uploads/${idFolder}/${file.filename}`;
            }

            // ảnh content từ tmp folder
            if (formData.tmpFolder) {
                const tmpPath = path.join(__dirname, '../../public/uploads/tmp', formData.tmpFolder);

                if (fsExtra.existsSync(tmpPath)) {
                    fsExtra.moveSync(tmpPath, uploadFolder, { overwrite: true });

                    if (formData.body) {
                        newdb.body = newdb.body.replace(
                            new RegExp(`/uploads/tmp/${formData.tmpFolder}`, 'g'),
                            `/uploads/${idFolder}`
                        );
                    }
                }
            }

            return newdb.save();
        });
    }

    // Upload tạm ảnh (multer xử lý tạm)
    uploadTempFile(req, res, tmpFolder) {
        const uploadPath = path.join(__dirname, '../../public/uploads/tmp', tmpFolder);
        if (!fsExtra.existsSync(uploadPath)) fsExtra.mkdirpSync(uploadPath);

        const storage = multer.diskStorage({
            destination: (req, file, cb) => cb(null, uploadPath),
            filename: (req, file, cb) => cb(null, Date.now() + '-' + file.newdbname),
        });

        const upload = multer({ storage }).single('image');

        return new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) return reject(err);

                resolve({
                    url: `/uploads/tmp/${tmpFolder}/${req.file.filename}`
                });
            });
        });
    }

    // Lấy bài viết để sửa
    getNewsById(id) {
        return Newdb.findById(id);
    }

    // Cập nhật bài viết
    updateNews(id, formData, file) {
        return Newdb.findById(id)
        .then(newdb => {
            const idFolder = newdb._id.toString();
            const uploadFolder = path.join(__dirname, '../../public/uploads', idFolder);
            fsExtra.ensureDirSync(uploadFolder);

            if (file) {
                const thumbSrc = file.path;
                const thumbDest = path.join(uploadFolder, file.filename);

                // xoá thumbnail cũ
                if (newdb.thumbnail && fsExtra.existsSync(path.join(__dirname, '../../public', newdb.thumbnail))) {
                    fsExtra.removeSync(path.join(__dirname, '../../public', newdb.thumbnail));
                }

                fsExtra.moveSync(thumbSrc, thumbDest, { overwrite: true });
                formData.thumbnail = `/uploads/${idFolder}/${file.filename}`;
            }

            if (formData.tmpFolder) {
                const tmpPath = path.join(__dirname, '../../public/uploads/tmp', formData.tmpFolder);

                if (fsExtra.existsSync(tmpPath)) {
                    fsExtra.moveSync(tmpPath, uploadFolder, { overwrite: true });

                    if (formData.body) {
                        formData.body = formData.body.replace(
                            new RegExp(`/uploads/tmp/${formData.tmpFolder}`, 'g'),
                            `/uploads/${idFolder}`
                        );
                    }
                }
            }

            return Newdb.findByIdAndUpdate(id, { ...formData }, { new: true });
        });
    }

    // Clone bài viết
    cloneNews(id) {
        let original;

        return Newdb.findById(id)
        .then(newdb => {
            original = newdb;

            const cloned = new Newdb({
                name: newdb.name,
                thumbnail: newdb.thumbnail,
                description: newdb.description,
                body: newdb.body,
                author: newdb.author,
                source: newdb.source,
                images: [...newdb.images]
            });

            return cloned.save();
        })
        .then(newClone => {
            const oldId = original._id.toString();
            const newId = newClone._id.toString();

            const oldFolder = path.join(__dirname, '../../public/uploads', oldId);
            const newFolder = path.join(__dirname, '../../public/uploads', newId);

            fsExtra.ensureDirSync(newFolder);

            if (fsExtra.existsSync(oldFolder)) {
                fsExtra.copySync(oldFolder, newFolder);
            }

            if (original.thumbnail) {
                newClone.thumbnail = original.thumbnail.replace(oldId, newId);
            }

            if (Array.isArray(original.images)) {
                newClone.images = original.images.map(img =>
                    img.replace(`/uploads/${oldId}`, `/uploads/${newId}`)
                );
            }

            if (original.body) {
                newClone.body = original.body.replace(
                    new RegExp(`/uploads/${oldId}`, 'g'),
                    `/uploads/${newId}`
                );
            }

            return newClone.save();
        });
    }

    // Xoá mềm
    softDelete(id) {
        return Newdb.delete({ _id: id });
    }

    // Xoá vĩnh viễn
    forceDelete(id) {
        const folder = path.join(__dirname, '../../public/uploads', id.toString());

        if (fsExtra.existsSync(folder)) {
            fsExtra.removeSync(folder);
        }

        return Newdb.deleteOne({ _id: id });
    }

    // Khôi phục
    restore(id) {
        return Newdb.restore({ _id: id });
    }
}

module.exports = new AdminService();
