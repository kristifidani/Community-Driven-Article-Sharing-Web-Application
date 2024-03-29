let mongoose = require("mongoose");

//Article schema
let commentSchema = mongoose.Schema({
  articleID: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: new Date(),
  },
  comment: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
