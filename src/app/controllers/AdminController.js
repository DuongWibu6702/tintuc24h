const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');
const AdminService = require('../services/AdminService');

class AdminController {

    storedNews(req, res, next) {
        AdminService.getStoredNews()
            .then(([newdb, deletedCount]) => {
                res.render('admin/storedNews', {
                    newdb: multipleMongooseToObject(newdb),
                    deletedCount
                });
            })
            .catch(next);
    }

    trashNews(req, res, next) {
        AdminService.getTrashNews()
            .then(newdb => {
                res.render('admin/trashNews', {
                    newdb: multipleMongooseToObject(newdb)
                });
            })
            .catch(next);
    }

    create(req, res) {
        res.render('admin/posts/add-new');
    }

    store(req, res, next) {
        AdminService.createNews(req.body, req.file)
            .then(() => res.redirect('/admin/stored/news'))
            .catch(next);
    }

    uploadTemp(req, res, next) {
        const tmp = req.params.tmpFolder;

        AdminService.uploadTempFile(req, res, tmp)
            .then(file => {
                res.status(200).json({ success: 1, file });
            })
            .catch(err => {
                res.status(500).json({ success: 0, message: err.message });
            });
    }

    edit(req, res, next) {
        AdminService.getNewsById(req.params.id)
            .then(newdb => {
                res.render('admin/posts/edit', { newdb: mongooseToObject(newdb) });
            })
            .catch(next);
    }

    update(req, res, next) {
        AdminService.updateNews(req.params.id, req.body, req.file)
            .then(updated => res.redirect('/news/' + updated.slug))
            .catch(next);
    }

    clone(req, res, next) {
        AdminService.cloneNews(req.params.id)
            .then(() => res.redirect('/admin/stored/news'))
            .catch(next);
    }

    destroy(req, res, next) {
        AdminService.softDelete(req.params.id)
            .then(() => res.redirect('/admin/stored/news'))
            .catch(next);
    }

    forceDestroy(req, res, next) {
        AdminService.forceDelete(req.params.id)
            .then(() => res.redirect('/admin/trash/news'))
            .catch(next);
    }

    restore(req, res, next) {
        AdminService.restore(req.params.id)
            .then(() => res.redirect('/admin/trash/news'))
            .catch(next);
    }
}

module.exports = new AdminController();
