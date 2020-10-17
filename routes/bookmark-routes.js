const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const Post = require("../models/post-schema");
const User = require("../models/user-schema");

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

router.get("/bookmarks/:id", verifyJwtToken, async (req, res, next) => {
  let bookmarks = await User.findById(req.params.id);
  res.json({ message: "All bookmarked posts", bookmarks });
});

router.put("/add/:id", verifyJwtToken, async (req, res, next) => {
  let user = await User.findById(req._id);
  if (user.bookmarks.includes(req.params.id)) {
    res.json({ message: "Post is already in bookmarks" });
  } else {
    let post = await Post.findById(req.params.id);
    let updatedUser = await User.update(
      { _id: req._id },
      { $push: { bookmarks: post } }
    );
    let user = await User.findById(req._id);
    res.json({ message: "Post was added to bookmarks", user });
  }
});

router.put("/remove/:id", verifyJwtToken, async (req, res, next) => {
  let user = await User.findById(req._id);

  if (!!user.bookmarks.find((x) => x._id == req.params.id)) {
    let post = await Post.findById(req.params.id);
    let updatedUser = await User.update(
      { _id: req._id },
      { $pull: { bookmarks: post } }
    );
    let user = await User.findById(req._id);

    res.json({ message: "Post was removed from bookmarks", user });
  } else {
    res.json({ message: "Post in not in bookmarks" });
  }
});

module.exports = router;
