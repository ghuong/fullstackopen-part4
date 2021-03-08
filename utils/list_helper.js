const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  const { title, author, url, likes } = blogs.reduce((favorite, blog) => {
    if (favorite === null) return blog;

    return blog.likes > favorite.likes ? blog : favorite;
  }, null);

  return { title, author, url, likes };
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null;

  // e.g. { "Nick Graham": 5, "Sarah Miller": 3 }
  const authorOccurrences = blogs.reduce((authorOccurrences, blog) => {
    if (authorOccurrences[blog.author]) authorOccurrences[blog.author]++;
    else authorOccurrences[blog.author] = 1;

    return authorOccurrences;
  }, {});

  // e.g. { author: "Nick", blogs: 5 }
  return Object.keys(authorOccurrences).reduce((mostFrequentAuthor, author) => {
    if (mostFrequentAuthor === null)
      return { author, blogs: authorOccurrences[author] };

    if (authorOccurrences[author] > mostFrequentAuthor.blogs) {
      return { author, blogs: authorOccurrences[author] };
    } else {
      return mostFrequentAuthor;
    }
  }, null);
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
};
