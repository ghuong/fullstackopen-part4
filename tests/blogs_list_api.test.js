const mongoose = require("mongoose");
const helper = require("./test_helper");
const Blog = require("../models/blog");
const app = require("../app");
const supertest = require("supertest");
const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test("blogs have an id", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body[0].id).toBeDefined();
});

test("a valid blog can be added", async () => {
  const newBlog = {
    author: "Alan Turing",
    title: "Computer Science",
    url: "https://en.wikipedia.org/wiki/Alan_Turing",
    likes: 20,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const blogJSONs = blogsAtEnd.map((blog) => {
    const { author, title, url, likes } = blog;
    return { author, title, url, likes };
  });

  expect(blogJSONs).toContainEqual(newBlog);
});

test("adding blog without likes will default to 0 likes", async () => {
  const newBlog = {
    author: "Ada Lovelace",
    title: "Computer Science",
    url: "https://en.wikipedia.org/wiki/Alan_Turing",
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const addedBlog = blogsAtEnd.find(blog => blog.author === "Ada Lovelace");
  expect(addedBlog.likes).toBe(0);
});

test("blog without title or url are not added", async () => {
  const newBlog = {
    author: "Kim Kardashian",
    likes: 1000000,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(400);
  
  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
})

afterAll(() => {
  mongoose.connection.close();
});
