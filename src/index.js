'use strict';

var request = require( 'request' );
var cheerio = require( 'cheerio' );
var async = require( 'async' );

var todaysFrontPage = function todaysFrontPage() {

  if ( !( this instanceof todaysFrontPage )) {
    return new todaysFrontPage();
  }

  var self = this;

  this.creds = require( '../credentials.js' );
  this.data = require( './data.js' );

  this.url = 'http://www.newseum.org/todaysfrontpages/?tfp_show=all';
  this.today = new Date().toDateString();

  this.pages = new this.data.Pages();
  this.tweets = new this.data.Tweets();

  this.tweetQueue = async.queue( self.sendTweets.bind( self ), 10 );

  return {
    init: function init() {
      async.series([
        self.getFrontPages.bind( self ),
        self.getTweets.bind( self ),
        self.prepareTweets.bind( self )
      ]);
    }
  };
};

todaysFrontPage.prototype.getFrontPages = function getFrontPages( callback ) {

  var self = this;

  console.log( 'getting the front pages' );

  request( self.url, getPage );

  function getPage( err, res, body ) {
    if ( err ) {
      console.log( err );
    }

    var $ = cheerio.load( body );
    var pages = $( 'p.thumbnail a img' );

    async.eachSeries( pages, savePage, function() {
      console.log( 'processed ' + self.pages.length + ' pages' );

      callback();
    });

    function savePage( page, localCallback ) {
      var el = $( page );
      var src = el.attr( 'src' );
      var largeSrc = src.replace( '/med', '/lg' );
      var title = el.parents( 'p.thumbnail' ).siblings( 'h4' ).text().trim();
      var loc = el.parents( 'p.thumbnail' ).siblings( 'div' ).text().trim();

      self.pages.add({
        src: largeSrc,
        title: title,
        loc: loc
      });

      localCallback();
    }
  }

};

todaysFrontPage.prototype.getTweets = function getTweets( callback ) {

  console.log( 'getting tweets' );

  var tweet = require( './tweet.js' )( this.creds );

  tweet.getTweets( this, callback );

};

todaysFrontPage.prototype.prepareTweets = function prepareTweets( callback ) {
  console.log( 'fetching images' );

  this.tweetQueue.push( 'image' );

  callback();
};

todaysFrontPage.prototype.sendTweets = function sendTweets( tweet, callback ) {
  console.log( 'sending tweets' );

  callback();
};


var fp = todaysFrontPage();

fp.init();



/* function getPage( err, res, body ) {


  var timeline = tweet.getTweets();

  console.log( timeline );
  return;

  async.eachLimit( imgs, 10, function( img, callback ) {

    var el = $( img );
    var src = el.attr( 'src' );
    var largeSrc = src.replace( '/med', '/lg' );
    var title = el.parents( 'p.thumbnail' ).siblings( 'h4' ).text().trim();
    var loc = el.parents( 'p.thumbnail' ).siblings( 'div' ).text().trim();

    if ( title in timeline ) {
      return;
    }

    request({
      url: largeSrc,
      encoding: 'binary'
    }, function( err, res, body ) {
      if ( err ) {
        console.log( err );
      }

      var b64img = new Buffer( body, 'binary' ).toString( 'base64' );

      tweet.update({
        img: b64img,
        text: title + ' - ' + today + ' - ' + loc
      }, callback );
    });

  });

} */


