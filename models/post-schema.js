const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    user: Schema.Types.ObjectId,
    usersThatLikedThePost: [Schema.Types.ObjectId],
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
