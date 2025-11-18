const Newdb = require('../models/news')
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose')
const path = require('path');
const fsExtra = require('fs-extra');
const multer = require('multer');

class AdminController {

    // [GET] /posts
    storedNews(req, res, next) {
        Promise.all([
            Newdb.find({}),
            Newdb.countDocumentsDeleted()
        ])
            .then(([newdb, deletedCount]) => {
                res.render('admin/storedNews', {
                    newdb: multipleMongooseToObject(newdb),
                    deletedCount: deletedCount
                });
            })
            .catch(next);
    }
    
    // [GET] /trash
    trashNews(req, res, next) {
        Newdb.findDeleted({})
            .then(newdb => res.render('admin/trashNews', {
                newdb: multipleMongooseToObject(newdb)
            }))
            .catch(next)
    }

    // [GET] /admin/posts/add-new
    create(req, res, next) {
        res.render('admin/posts/add-new');
    }

    // [POST] /admin/posts/store
    store(req, res, next) {
        const formData = req.body;

        const newdb = new Newdb({ ...formData });
        newdb.save()
            .then(newdb => {
                const idFolder = newdb._id.toString();

                // Tạo folder ID nếu chưa có
                const uploadFolder = path.join(__dirname, '../../public/uploads', idFolder);
                fsExtra.ensureDirSync(uploadFolder);

                // Di chuyển thumbnail nếu có
                if (req.file) {
                    const thumbSrc = req.file.path;
                    const thumbDest = path.join(uploadFolder, req.file.filename);
                    fsExtra.moveSync(thumbSrc, thumbDest, { overwrite: true });
                    newdb.thumbnail = `/uploads/${idFolder}/${req.file.filename}`;
                }

                // Di chuyển ảnh trong body từ tmpFolder nếu có
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
            })
            .then(() => res.redirect('/admin/stored/news'))
            .catch(next);
    }

    // [POST] /admin/posts/upload/tmp/:tmpFolder
    uploadTemp(req, res, next) {
        const tmpFolder = req.params.tmpFolder;
        const uploadPath = path.join(__dirname, '../../public/uploads/tmp', tmpFolder);
        if (!fsExtra.existsSync(uploadPath)) fsExtra.mkdirpSync(uploadPath);

        const storage = multer.diskStorage({
            destination: (req, file, cb) => cb(null, uploadPath),
            filename: (req, file, cb) => cb(null, Date.now() + '-' + file.newdbname),
        });

        const upload = multer({ storage }).single('image');

        upload(req, res, (err) => {
            if (err) return res.status(500).json({ success: 0, message: err.message });
            res.status(200).json({
                success: 1,
                file: { url: `/uploads/tmp/${tmpFolder}/${req.file.filename}` },
            });
        });
    }

    // [GET] /admin/posts/edit/:id
    edit(req, res, next) {
        Newdb.findById(req.params.id)
            .then(newdb => res.render('admin/posts/edit', { newdb: mongooseToObject(newdb) }))
            .catch(next);
    }

    // [PUT] /admin/posts/:id
    update(req, res, next) {
        const formData = req.body;

        Newdb.findById(req.params.id)
            .then(newdb => {
                const idFolder = newdb._id.toString();
                const uploadFolder = path.join(__dirname, '../../public/uploads', idFolder);
                fsExtra.ensureDirSync(uploadFolder);

                // Di chuyển thumbnail mới nếu có
                if (req.file) {
                    const thumbSrc = req.file.path;
                    const thumbDest = path.join(uploadFolder, req.file.filename);

                    // Xóa thumbnail cũ nếu có
                    if (newdb.thumbnail && fsExtra.existsSync(path.join(__dirname, '../../public', newdb.thumbnail))) {
                        fsExtra.removeSync(path.join(__dirname, '../../public', newdb.thumbnail));
                    }

                    fsExtra.moveSync(thumbSrc, thumbDest, { overwrite: true });
                    formData.thumbnail = `/uploads/${idFolder}/${req.file.filename}`;
                }

                // Di chuyển ảnh trong body từ tmpFolder nếu có
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

                return Newdb.findByIdAndUpdate(req.params.id, { ...formData }, { new: true });
            })
            .then(updated => res.redirect('/news/' + updated.slug))
            .catch(next);
    }

    // [POST] /admin/posts/clone/:id
    clone(req, res, next) {
        Newdb.findById(req.params.id)
        .then(newdb => {

            // Tạo bản mới KHÔNG gán slug để middleware tự tạo slug mới
            const cloned = new Newdb({
                name: newdb.name,
                thumbnail: newdb.thumbnail,
                description: newdb.description,
                body: newdb.body,
                author: newdb.author,
                source: newdb.source,
                images: [...newdb.images],
            });

            return cloned.save()
                .then(newClone => ({ newdb, newClone }));
        })
        .then(({ newdb, newClone }) => {

            const oldId = newdb._id.toString();
            const newId = newClone._id.toString();

            const oldFolder = path.join(__dirname, '../../public/uploads', oldId);
            const newFolder = path.join(__dirname, '../../public/uploads', newId);

            fsExtra.ensureDirSync(newFolder);

            // Copy thư mục ảnh
            if (fsExtra.existsSync(oldFolder)) {
                fsExtra.copySync(oldFolder, newFolder);
            }

            // Update thumbnail
            if (newdb.thumbnail) {
                newClone.thumbnail = newdb.thumbnail.replace(oldId, newId);
            }

            // Update images[]
            if (Array.isArray(newdb.images)) {
                newClone.images = newdb.images.map(img =>
                    img.replace(`/uploads/${oldId}`, `/uploads/${newId}`)
                );
            }

            // Update body
            if (newdb.body) {
                newClone.body = newdb.body.replace(
                    new RegExp(`/uploads/${oldId}`, 'g'),
                    `/uploads/${newId}`
                );
            }

            return newClone.save();
        })
        .then(() => res.redirect('/admin/stored/news'))
        .catch(next);
    }

    // [DELETE] /admin/:id
    destroy(req, res, next) {
        Newdb.delete({ _id: req.params.id })
            .then(() => res.redirect('/admin/stored/news'))
            .catch(next);
    }

    // [DELETE] /admin/force/:id
    forceDestroy(req, res, next) {
        Newdb.findById(req.params.id)
            .then(newdb => {
                // Xóa folder ID
                const _id = req.params.id
                const uploadFolder = path.join(__dirname, '../../public/uploads', _id.toString());
                if (fsExtra.existsSync(uploadFolder)) fsExtra.removeSync(uploadFolder);

                return Newdb.deleteOne({ _id });
            })
            .then(() => res.redirect('/admin/trash/news'))
            .catch(next);
    }

    // [PATCH] /admin/restore/:id
    restore(req, res, next) {
        Newdb.restore({ _id: req.params.id })
            .then(() => res.redirect('/admin/trash/news'))
            .catch(next);
    }
}

module.exports = new AdminController()