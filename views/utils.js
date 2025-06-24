// utils.js
const cheerio = require('cheerio');

function analyzeAccessibility(html) {
  const $ = cheerio.load(html);
  const issues = [];

  if ($('img:not([alt])').length > 0) {
    issues.push('Some images are missing alt attributes.');
  }

  if ($('a:not([href])').length > 0) {
    issues.push('Some links are missing href attributes.');
  }

  return issues;
}

module.exports = {
  analyzeAccessibility
};
