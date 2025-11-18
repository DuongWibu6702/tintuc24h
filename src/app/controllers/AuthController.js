const User = require('../models/User');

class AuthController {

    // [GET] /login
    loginForm(req, res) {
        res.render('auth/login', { error: null });
    }

    // [POST] /login
    login(req, res, next) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.render('auth/login', { error: 'Username và password bắt buộc' });
        }

        User.findOne({ username })
            .then(user => {
                if (!user) {
                    return res.render('auth/login', { error: 'Sai tài khoản hoặc mật khẩu' });
                }

                return user.comparePassword(password)
                    .then(match => {
                        if (!match) {
                            return res.render('auth/login', { error: 'Sai tài khoản hoặc mật khẩu' });
                        }

                        // Lưu session
                        req.session.user = {
                            id: user._id.toString(),
                            username: user.username,
                            role: user.role
                        };

                        // Admin → vào /admin
                        if (user.role === 'admin') {
                            return res.redirect('/admin');
                        }

                        // User → về trang chủ
                        return res.redirect('/');
                    });
            })
            .catch(next);
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
