module.exports = function (req, res, next) {
    res.locals.user = req.session ? req.session.user : null;
    next();
};
