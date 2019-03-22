const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = new Schema(
  {
    lemma               : String,
    review_id           : String,
    post_id             : Number,
    pos                 : String
  },
  { collection : 'tokens' }
);

module.exports = mongoose.model("token", TokenSchema);
