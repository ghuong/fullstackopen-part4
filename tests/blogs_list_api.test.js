const mongoose = require("mongoose");
const helper = require("./test_helper");
const Blog = require("../models/blog");
const app = require("../app");
const supertest = require("supertest");
const api = supertest(app);

let jwt;

beforeAll(async () => {
  await helper.initUsersDb();
  const response = await api.post("/api/login").send({
    username: "root",
    password: "sekret",
  });
  jwt = response.body.token;
});

beforeEach(async () => {
  await Blog.deleteMany({});
  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

describe("when there is initially some blogs saved", () => {
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
});

describe("addition of a new blog", () => {
  test("succeeds with valid data", async () => {
    const newBlog = {
      author: "Alan Turing",
      title: "Computer Science",
      url: "https://en.wikipedia.org/wiki/Alan_Turing",
      likes: 20,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", `bearer ${jwt}`)
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

  test("succeeds with missing optional properties given default values", async () => {
    const newBlog = {
      author: "Ada Lovelace",
      title: "Computer Science",
      url: "https://en.wikipedia.org/wiki/Alan_Turing",
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${jwt}`)
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

    const addedBlog = blogsAtEnd.find((blog) => blog.author === "Ada Lovelace");
    expect(addedBlog.likes).toBe(0);
  });

  test("fails with status code 400 if invalid data", async () => {
    const newBlog = {
      author: "Kim Kardashian",
      likes: 1000000,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `bearer ${jwt}`)
      .send(newBlog)
      .expect(400);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });

  test("fails with status code 401 if token not provided", async () => {
    const newBlog = {
      author: "Alan Turing",
      title: "Computer Science",
      url: "https://en.wikipedia.org/wiki/Alan_Turing",
      likes: 20,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(401);
    
    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
  });
});

describe("updating of a blog", () => {
  test("succeeds with valid data", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];
    const newLikes = blogToUpdate.likes + 100;
    const newBlogData = {
      ...blogToUpdate,
      likes: newLikes,
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlogData)
      .set("Authorization", `bearer ${jwt}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const updatedBlog = blogsAtEnd.find((b) => b.id === blogToUpdate.id);
    expect(updatedBlog.likes).toBe(newLikes);
  });

  test("fails with status code 400 with invalid id", async () => {
    const validNonexistingId = helper.nonExistingId();

    console.log(validNonexistingId);

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .set("Authorization", `bearer ${jwt}`)
      .expect(400);
  });
});

describe("deletion of a blog", () => {
  test("deleting a blog", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `bearer ${jwt}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const titles = blogsAtEnd.map((b) => b.title);
    expect(titles).not.toContain(blogToDelete.title);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
