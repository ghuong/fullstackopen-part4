const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  const { title, author, url, likes } = blogs.reduce(
    (favorite, blog) => (blog.likes > favorite.likes ? blog : favorite),
    blogs[0]
  );

  return { title, author, url, likes };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
};
