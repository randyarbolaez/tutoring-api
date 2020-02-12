const express = require("express");
const router = express.Router();

const Post = require("../models/post-schema");
const jwt = require("jsonwebtoken");

const verifyJwtToken = (req, res, next) => {
  let token;
  if ("authorization" in req.headers) {
    token = req.headers["authorization"].split(" ")[1];
  }
  if (!token) {
    return res.status(403).send({ auth: false, message: "No token provided" });
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(500)
          .send({ auth: false, message: "Token authentication failed." });
      } else {
        req._id = decoded._id;
        next();
      }
    });
  }
};

router.post("/create", verifyJwtToken, (req, res, next) => {
  new Post({
    title: req.body.title,
    description: req.body.description,
    user: req._id
  }).save((err, doc) => {
    if (!err) {
      res.send(doc);
    } else {
      res.send(err);
    }
  });
});

router.get("/posts", (req, res, next) => {
  Post.find()
    .then(allPosts => {
      res.send({ allPosts });
    })
    .catch(err => {
      res.send({ err });
    });
});

router.delete("/delete/:id", verifyJwtToken, (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (req._id == post.user) {
      Post.findByIdAndRemove(post.id)
        .then(removedPost => {
          res.send({ message: "Post was deleted", removedPost });
        })
        .catch(err => {
          res.send({ err });
        });
    } else {
      res.send({ message: "Only user can delete post" });
    }
  });
});

module.exports = router;
