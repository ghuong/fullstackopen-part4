const jwt = require("jsonwebtoken");
const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const userExtractor = require("../utils/middleware").userExtractor;
const logger = require("../utils/logger");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post("/", userExtractor, async (request, response) => {
  const body = request.body;

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ?? 0,
    user: request.user._id,
  });

  const savedBlog = await blog.save();
  request.user.blogs = request.user.blogs.concat(blog._id); // Add blog post to user's blogs
  await request.user.save();

  return response.status(201).json(savedBlog);
});

blogsRouter.put("/:id", async (request, response) => {
  const body = request.body;
  const blog = {
    author: body.author,
    title: body.title,
    url: body.url,
    likes: body.likes,
  };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });
  response.json(updatedBlog);
});

blogsRouter.delete("/:id", userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id);

  if (blog.user.toString() !== request.user._id.toString()) {
    logger.error("blog.user: ", blog.user.toString(), "user:", request.user._id);
    return response
      .status(401)
      .json({ error: "you are not authorized to delete this blog post" });
  }

  await blog.delete();
  response.status(204).end();
});

module.exports = blogsRouter;
