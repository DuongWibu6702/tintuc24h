const AuthService = require('../services/AuthService');

class AuthController {

    // [GET] /login
    loginForm(req, res) {
        res.render('auth/login', { error: null });
    }

    // [POST] /login
    login(req, res, next) {
        const { username, password } = req.body;

        AuthService.login(username, password)
            .then(user => {
                req.session.user = {
                    id: user._id.toString(),
                    username: user.username,
                    role: user.role
                };

                if (user.role === 'admin') {
                    return res.redirect('/admin/stored/news');
                }

                return res.redirect('/');
            })
            .catch(err => {
                res.render('auth/login', { error: err.msg || 'Lỗi hệ thống' });
            });
    }

    // [GET] /register
    registerForm(req, res) {
        res.render('auth/register', { error: null });
    }

    // [POST] /register
    register(req, res, next) {
        const { username, password, confirmPassword } = req.body;

        AuthService.register(username, password, confirmPassword)
            .then(() => res.redirect('/login'))
            .catch(err => {
                res.render('auth/register', {
                    error: err.msg || 'Lỗi hệ thống'
                });
            });
    }

    // [GET] /logout
    logout(req, res, next) {
        req.session.destroy(err => {
            if (err) return next(err);
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    }
}

module.exports = new AuthController();
