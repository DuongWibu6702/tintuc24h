const User = require('../models/User');

class AuthService {

    // Đăng ký
    register(username, password, confirmPassword) {
        return new Promise((resolve, reject) => {

            if (!username || !password || !confirmPassword) {
                return reject({ msg: 'Vui lòng nhập đầy đủ thông tin.' });
            }

            if (password !== confirmPassword) {
                return reject({ msg: 'Mật khẩu nhập lại không khớp.' });
            }

            User.findOne({ username })
                .then(existingUser => {
                    if (existingUser) {
                        return reject({ msg: 'Tên đăng nhập đã tồn tại.' });
                    }

                    const user = new User({
                        username,
                        password
                    });

                    return user.save();
                })
                .then(user => resolve(user))
                .catch(err => reject(err));
        });
    }

    // Đăng nhập
    login(username, password) {
        return new Promise((resolve, reject) => {

            if (!username || !password) {
                return reject({ msg: 'Username và password bắt buộc' });
            }

            User.findOne({ username })
                .then(user => {
                    if (!user) return reject({ msg: 'Sai tài khoản' });

                    return user.comparePassword(password)
                        .then(match => {
                            if (!match) return reject({ msg: 'Sai mật khẩu' });

                            resolve(user);
                        });
                })
                .catch(err => reject(err));
        });
    }
}

module.exports = new AuthService();
