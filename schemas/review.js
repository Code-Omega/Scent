const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
  {
    text                : String,
    opinion             : String,
    post_id             : Number
  },
  { collection : 'reviews' }
);

ReviewSchema.set('toJSON', {
    virtuals: true
});

ReviewSchema.set('toObject', {
    virtuals: true
});

module.exports = mongoose.model("review", ReviewSchema);
