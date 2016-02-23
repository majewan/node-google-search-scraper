'use strict';

var assert = require('assert'),
    GoogleSearchScraper = require('..'),
    Solver = require('../commandLineSolver.js');

describe('GoogleSearchScraper', function() {
  describe('OptionLimit', function() {

    it('Without limit option', function(done){
      this.timeout(60000);
      GoogleSearchScraper.search({ query : 'site:nodejs.org', solver: Solver }, function(err, results){
        if(err){
          throw err;
        }
        console.log(results.length);
        assert.notEqual(results.length, 0, 'Request site:nodejs.org can\'t have 0 results.');
        if(results.length < 100){
          assert.fail(result.length, 100, 'Request site:nodejs.org can\'t have less than 100 results.');
        }
        done();
      });
    });

    it('With 20 limit results', function(done){
      this.timeout(30000);
      GoogleSearchScraper.search({ query : 'site:wikipedia.fr', limit: 20 , solver: Solver }, function(err, results){
        if(err){
          throw err;
        }
        assert.strictEqual(results.length, 20, 'Must be equal to 20 results.');
        done();
      });
    });

  });

});
