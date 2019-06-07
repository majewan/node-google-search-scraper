'use strict';
var GoogleSearchScraper = require('./index.js');
const fs = require('fs');
const _ = require('lodash');

GoogleSearchScraper.search({ query : process.argv[2], limit : process.argv[3], keepPages: true }, function(err, results){
  console.log(JSON.stringify(_.omit(results, ['pages']), null, 4));
  results.pages.forEach((page,n) => {
    fs.writeFileSync('page' + n + '.html', page);
  });
  process.exit();
});
