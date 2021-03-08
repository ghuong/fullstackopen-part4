const dummy = (blogs) => 1;

/**
 * Given a list of blogs, calculate the total likes of all blogs
 * @param {Array} blogs list of blogs
 *
 * @returns {Number} total likes of all blogs
 */
const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0);
};

/**
 * Given a list of blogs, return blog with most likes
 * @param {Array} blogs list of blogs
 *
 * @returns {Object} { title, author, url, likes }
 */
const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  const { title, author, url, likes } = blogs.reduce((favorite, blog) => {
    if (favorite === null) return blog;

    return blog.likes > favorite.likes ? blog : favorite;
  }, null);

  return { title, author, url, likes };
};

/**
 * Given a list of blogs, return author with most blogs
 * @param {Array} blogs list of blogs
 *
 * @returns {Object}: { author, blogs },
 *  where "blogs" holds the number of blogs by the author
 */
const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null;

  // e.g. { "Nick Graham": 5, "Sarah Miller": 3 }
  const numBlogsPerAuthor = blogs.reduce((numBlogsPerAuthor, { author }) => {
    if (numBlogsPerAuthor[author]) numBlogsPerAuthor[author]++;
    else numBlogsPerAuthor[author] = 1;

    return numBlogsPerAuthor;
  }, {});

  // e.g. { author: "Nick", blogs: 5 }
  return Object.keys(numBlogsPerAuthor).reduce(
    (authorWithMostBlogs, author) => {
      if (authorWithMostBlogs === null)
        return { author, blogs: numBlogsPerAuthor[author] };

      if (numBlogsPerAuthor[author] > authorWithMostBlogs.blogs) {
        return { author, blogs: numBlogsPerAuthor[author] };
      } else {
        return authorWithMostBlogs;
      }
    },
    null
  );
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null;

  const likesPerAuthor = blogs.reduce((likesPerAuthor, { author, likes }) => {
    if (likesPerAuthor[author]) likesPerAuthor[author] += likes;
    else likesPerAuthor[author] = likes;

    return likesPerAuthor;
  }, {});

  return Object.keys(likesPerAuthor).reduce((authorWithMostLikes, author) => {
    if (authorWithMostLikes === null)
      return { author, likes: likesPerAuthor[author] };

    if (likesPerAuthor[author] > authorWithMostLikes.likes)
      return { author, likes: likesPerAuthor[author] };
    else return authorWithMostLikes;
  }, null);
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
