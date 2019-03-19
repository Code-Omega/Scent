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

module.exports = mongoose.model("review", ReviewSchema);
