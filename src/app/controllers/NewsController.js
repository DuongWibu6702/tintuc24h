const Newdb = require('../models/news');
const marked = require('marked');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');

class NewsController {

    // [GET] /news?page=
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

    // [GET] /news/:slug
    show(req, res, next) {
        Newdb.findOne({ slug: req.params.slug })
            .then(newdb => {
                newdb.body = marked.parse(newdb.body);
                res.render('news/show', { newdb: mongooseToObject(newdb) });
            })
            .catch(next);
    }
}

module.exports = new NewsController();
