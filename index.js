var request = require('request');
var cheerio = require('cheerio');
var url     = require('url');
var debug   = require('debug')('google-scraper');
var GoogleHtmlParser = require('google-html-parser');

function search(options, callback) {

  var session = request.defaults({ jar : true });

  var host = options.host || 'www.google.com';
  var solver = options.solver;
  var params = options.params || {};
  var outputDatas = {
    urls: [],
    pages: []
  };

  params.hl = params.hl || options.lang || 'en';

  if(options.age) params.tbs = 'qdr:' + options.age;
  if(options.query) params.q = options.query;

  params.start = 0;

  getPage(params, async function onPage(err, body) {
    if(err) {
      if(err.code !== 'ECAPTCHA' || !solver) return callback(err, outputDatas);

      solveCaptcha(err.location, function(err, page) {
        if(err) return callback(err, outputDatas);
        onPage(null, page);
      });

      return;
    }

    if(options.keepPages) outputDatas.pages.push(body);
    var currentResults = await extractResults(body);

    outputDatas.urls = outputDatas.urls.concat(currentResults);

    if(currentResults.length === 0) {
      debug('No more results.', currentResults.length, outputDatas.urls.length);
      return callback(null, outputDatas);
    }

    if(options.limit && outputDatas.urls.length >= options.limit){
      debug('Limit reached.');
      return callback(null, outputDatas);
    }else{
      params.start = outputDatas.urls.length;
      getPage(params, onPage);
    }
  });


  function getPage(params, callback, uri) {
    debug('Do request on google', params);
    session.get({
        uri: uri || 'https://' + host + '/search',
        qs: params,
        followRedirect: false
      },
      function followRedirect(err, res) {
        if(err) return callback(err);

        if(res.statusCode === 302) {
          var parsed = url.parse(res.headers.location, true);

          if(parsed.pathname !== '/search') {
            var err = new Error('Captcha');
            err.code = 'ECAPTCHA';
            err.location = res.headers.location;
            this.abort();
            return callback(err);
          } else {
            debug('Google redirect your request to', res.headers.location);
            return getPage(params, callback, res.headers.location);
          }
        }

        callback(null, res.body);
      }
    );
  }

  async function extractResults(body) {
    var results = [];
    const parsedResults = await GoogleHtmlParser.parse({ searchEngine: 'google' }, body);
    parsedResults.results.forEach((result) => {
      var parsed = url.parse(result.targetUrl, true);
      if (parsed.pathname === '/url') {
        results.push(parsed.query.q);
      }
    });
    return results;
  }

  function solveCaptcha(captchaUrl, callback) {

    var tmp = url.parse(captchaUrl);
    var baseUrl = url.format({
      protocol: tmp.protocol,
      hostname: tmp.host,
    });

    // Fetch captcha page
    session.get(captchaUrl, function(err, res) {
      if(err) return callback(err);

      var $ = cheerio.load(res.body);
      // TODO adaptative form response
      var captchaId = $('input[name=id]').attr('value');
      var captchaQ = $('input[name=q]').attr('value');
      var continueUrl = $('input[name=continue]').attr('value');
      var formAction = $('form').attr('action');
      var imgSrc = $('img').attr('src');

      // Fetch captcha image
      session.get({uri: baseUrl + imgSrc, encoding: null}, function(err, res) {
        if(err) return callback(err);

        // Send to solver
        solver.solve(res.body, function(err, id, solution) {
          if(err){
            debug('GOT AN ERROR FROM SOLVER :', err);
            return callback(err);
          }
          debug('Send request to solve captcha (%s)', baseUrl + '/sorry/' + formAction);
          // Try solution
          session.get({
              uri: baseUrl + '/sorry/' + formAction,
              qs: {
                id: captchaId,
                captcha: solution,
                continue: continueUrl,
                q: captchaQ
              }
            },
            function(err, res) {
              if(res.statusCode !== 200){
                var err = new Error('Captcha check failed');
                if(solver.report){
                  solver.report(id, err);
                }
                return callback(err);
              }
              callback(null, res.body);
            }
          );

        });

      });

    });

  }

}

module.exports.search = search;
