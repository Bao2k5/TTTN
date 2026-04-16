// src/utils/helpers.js
const slugify = (str) => {
    return str
      .toString()
      .normalize("NFKD")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };
  
  module.exports = { slugify };
  