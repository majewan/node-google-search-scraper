google-search-scraper
=============
### Google search scraper with captcha solving support

This module allows google search results extraction in a simple yet flexible way, and handles captcha solving transparently (through external services or your own hand-made solver).

Out of the box you can target a specific google search host, specify a language and limit search results returned. Extending these defaults with custom URL params is supported through options.

A word of warning: This code is intented for educational and research use only. Use responsibly.


Installation
------------

``` bash
$ npm install google-search-scraper
```


Examples
--------

Grab first 10 results for 'nodejs'

``` javascript
var scraper = require('google-search-scraper');

var options = {
  query: 'nodejs',
  limit: 10
};

scraper.search(options, function(err, result) {
  if(err) throw err;
  console.log(result.urls);
});
```

Various options combined

``` javascript
var scraper = require('google-search-scraper');

var options = {
  query: 'grenouille',
  host: 'www.google.fr',
  lang: 'fr',
  age: 'd1', // last 24 hours ([hdwmy]\d? as in google URL)
  limit: 10,
  params: {} // params will be copied as-is in the search URL query string
};

scraper.search(options, function(err, result) {
  // This is called for each result
  if(err) throw err;
  console.log(result.url);
});
```

Extract all results on edu sites for "information theory" and solve captchas along the way

``` javascript
var scraper = require('google-search-scraper');
var DeathByCaptcha = require('deathbycaptcha4');

DeathByCaptcha.credentials({ username: 'username', password: 'password' });

var options = {
  query: 'site:edu "information theory"',
  age: 'y', // less than a year,
  solver: DeathByCaptcha
};

scraper.search(options, function(err, result) {
  // This is called for each result
  if(err) throw err;
  console.log(result.urls);
});
```

You can easily plug your own solver, implementing a solve method with the following signature:
We provide a shell solver implementation but require X with eog or similar tool.

```javascript
var customSolver = {
  solve: function(imageData, callback) {
    // Do something with image data, like displaying it to the user
    // id is used by BDC to allow reporting solving errors and can be safely ignored here
    var id = null;
    callback(err, id, solutionText);
  }
};
```
