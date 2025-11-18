const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');
const mongooseDelete = require('mongoose-delete')

const Newdb = new Schema({
  name: { type: String, required: true },
  thumbnail: { type: String },
  description: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: String, required: true },
  source: { type: String },
  images: [{ type: String }],
  slug: { type: String, unique: true },
}, { timestamps: true });

// Tạo slug trước khi lưu
Newdb.pre('save', async function(next) {
  if (!this.slug) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let i = 1;
    const NewdbModel = mongoose.model('Newdb', Newdb, 'newdbs');

    while (await NewdbModel.exists({ slug })) {
      slug = `${baseSlug}-${i}`;
      i++;
    }

    this.slug = slug;
    }
    next();
});

// Add plugin
Newdb.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
})

module.exports = mongoose.model('Newdb', Newdb, 'newdbs')
