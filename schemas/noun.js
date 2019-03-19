const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NounSchema = new Schema(
  {
    lemma               : String,
    nunique             : Number,
    count               : Number
  },
  { collection : 'noun_list' }
);

module.exports = mongoose.model("noun", NounSchema);
