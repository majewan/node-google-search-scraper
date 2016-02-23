'use strict';
var GoogleSearchScraper = require('./index.js'),
Solver = require('./commandLineSolver.js');

GoogleSearchScraper.search({ query : process.argv[2], limit : process.argv[3], solver: Solver }, function(err, results){
  console.log(JSON.stringify(results));
  process.exit();
});
