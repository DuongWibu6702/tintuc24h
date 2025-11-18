const NewsService = require('../services/NewsService');
const { mongooseToObject, multipleMongooseToObject } = require('../../util/mongoose');

class NewsController {

    // [GET] /news?page=
    list(req, res, next) {
        const perPage = 10;
        const page = parseInt(req.query.page) || 1;

        NewsService.getPaginatedList(page, perPage)
            .then(([news, total]) => {
                res.render('news/index', {
                    newdb: multipleMongooseToObject(news),
                    current: page,
                    totalPages: Math.ceil(total / perPage)
                });
            })
            .catch(next);
    }

    // [GET] /news/:slug
    show(req, res, next) {
        NewsService.getNewsBySlug(req.params.slug)
            .then(news => {
                if (!news) return res.status(404).render('404');

                res.render('news/show', {
                    newdb: mongooseToObject(news)
                });
            })
            .catch(next);
    }

    // [GET] /api/news
    apiList(req, res, next) {
        NewsService.getAllNews()
            .then(news => {
                res.json({
                    success: true,
                    data: multipleMongooseToObject(news)
                });
            })
            .catch(next);
    }

    // [GET] /api/news/:slug
    apiDetail(req, res, next) {
        NewsService.getDetail(req.params.slug)
            .then(news => {
                if (!news) {
                    return res.status(404).json({
                        success: false,
                        msg: 'Not found'
                    });
                }

                res.json({
                    success: true,
                    data: mongooseToObject(news)
                });
            })
            .catch(next);
    }
}

module.exports = new NewsController();
