const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password trước khi lưu vào DB
UserSchema.pre('save', async function(next) {
    // Nếu password không thay đổi → skip
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// So sánh mật khẩu người dùng nhập với mật khẩu hash
UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
