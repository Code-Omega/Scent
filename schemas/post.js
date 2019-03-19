const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    name                : String,
    discussion_url      : String,
    tagline             : String,
    pros                : [String],
    cons                : [String]
  },
  { collection : 'posts' }
);

module.exports = mongoose.model("post", PostSchema);
