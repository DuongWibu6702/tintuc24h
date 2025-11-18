const Newdb = require('../models/News');
const marked = require('marked');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');

class NewsController {

    // [GET] /news?page=  (UI HTML)
    list(req, res, next) {
        const perPage = 10;
        const page = parseInt(req.query.page) || 1;

        Promise.all([
            Newdb.find({})
                .sort({ createdAt: -1 })
                .skip((page - 1) * perPage)
                .limit(perPage),

            Newdb.countDocuments({})
        ])
        .then(([newdb, total]) => {
            res.render('news/index', {
                newdb: multipleMongooseToObject(newdb),
                current: page,
                totalPages: Math.ceil(total / perPage)
            });
        })
        .catch(next);
    }

    // [GET] /news/:slug  (UI HTML)
    show(req, res, next) {
        Newdb.findOne({ slug: req.params.slug })
            .then(newdb => {
                if (!newdb) return res.status(404).render('404');

                newdb.body = marked.parse(newdb.body);

                res.render('news/show', {
                    newdb: mongooseToObject(newdb)
                });
            })
            .catch(next);
    }

    // API
    
    // [GET] /api/news
    apiList(req, res, next) {
        Newdb.find({})
            .sort({ createdAt: -1 })
            .then(news => {
                res.json({
                    success: true,
                    data: multipleMongooseToObject(news)
                });
            })
            .catch(err => {
                next(err);
            });
    }

    // [GET] /api/news/:slug
    apiDetail(req, res, next) {
        Newdb.findOne({ slug: req.params.slug })
            .then(newdb => {
                if (!newdb) {
                    return res.status(404).json({
                        success: false,
                        msg: 'Not found'
                    });
                }

                res.json({
                    success: true,
                    data: mongooseToObject(newdb)
                });
            })
            .catch(err => {
                next(err);
            });
    }
}

module.exports = new NewsController();
