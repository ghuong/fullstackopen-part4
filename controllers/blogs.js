const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const blog = new Blog(request.body);
  blog.likes = blog.likes ?? 0;
  if (!blog.title || !blog.url) {
    return response.status(400).error({
      error: "blog must contain a title and url",
    });
  }
  const result = await blog.save();
  response.status(201).json(result);
});

module.exports = blogsRouter;
