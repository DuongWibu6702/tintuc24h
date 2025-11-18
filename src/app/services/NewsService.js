const Newdb = require('../models/News');
const marked = require('marked');

class NewsService {

    // Lấy danh sách phân trang
    getPaginatedList(page, perPage) {
        return Promise.all([
            Newdb.find({})
                .sort({ createdAt: -1 })
                .skip((page - 1) * perPage)
                .limit(perPage),

            Newdb.countDocuments({})
        ]);
    }

    // Lấy bài viết theo slug
    getNewsBySlug(slug) {
        return Newdb.findOne({ slug }).then(news => {
            if (!news) return null;
            news.body = marked.parse(news.body);
            return news;
        });
    }

    // API: danh sách JSON
    getAllNews() {
        return Newdb.find({})
            .sort({ createdAt: -1 });
    }

    // API: chi tiết JSON
    getDetail(slug) {
        return Newdb.findOne({ slug });
    }
}

module.exports = new NewsService();
