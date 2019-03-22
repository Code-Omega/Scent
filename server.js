const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const Noun = require("./schemas/noun");
const Review = require("./schemas/review");
const Post = require("./schemas/post");
const Token = require("./schemas/token");

const API_PORT = process.env.PORT || 3001;
const app = express();
const router = express.Router();

// this is our MongoDB database
const dbRoute = 'mongodb://hunter:muppe7-popmYs-qochef@ds017205.mlab.com:17205/product_scent';

// connects our back end code with the database
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

let groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// this is our get method
// this method fetches all available data in our database
router.get("/getNoun", (req, res) => {
  Noun.find({}, null,{sort: {'count': -1}, limit: 100}, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

router.get("/getByLemma/:lemma", (req, res) => {
  Token.find({'lemma': req.params.lemma}, {review_id: 1, post_id: 1, _id: 0}, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    let review_ids = [...new Set(data.map(({ review_id }) => review_id))];
    let post_ids = [...new Set(data.map(({ post_id }) => post_id))];
    // console.log(data);
    // console.log(review_ids);
    // console.log(post_ids);
    // return res.json({ success: true, data: data });
    Review.find({'_id': {$in: review_ids}}, (err, review_data) => {
      if (err) return res.json({ success: false, error: err });
      Post.find({'id': {$in: post_ids}}, (err, post_data) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: {'reviews':review_data,'posts':post_data} });
      });
    });
  });
});

// router.get("/getAdj", (req, res) => {
//   Adj.find((err, data) => {
//     if (err) return res.json({ success: false, error: err });
//     return res.json({ success: true, data: data });
//   });
// });
//
// router.get("/getReview", (req, res) => {
//   Review.find((err, data) => {
//     if (err) return res.json({ success: false, error: err });
//     return res.json({ success: true, data: data });
//   });
// });
//
// router.get("/getPost", (req, res) => {
//   Post.find((err, data) => {
//     if (err) return res.json({ success: false, error: err });
//     return res.json({ success: true, data: data });
//   });
// });

// append /api for our http requests
app.use("/api", router);

// for react app
if(process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendfile(path.join(__dirname = 'build/index.html'));
  })
}
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'public/index.html'));
})

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
