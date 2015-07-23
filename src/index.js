'use strict';

var request = require( 'request' );
var cheerio = require( 'cheerio' );
var async = require( 'async' );

var creds = require( '../credentials.js' );
var tweet = require( './tweet.js' )( creds );

var data = require( './data.js' );


var todaysFrontPage = function todaysFrontPage() {

  if ( !( this instanceof todaysFrontPage )) {
    return new todaysFrontPage();
  }

  var self = this;

  this.url = 'http://www.newseum.org/todaysfrontpages/?tfp_show=all';
  this.today = new Date().toDateString();

  this.pages = new data.Pages();
  this.tweets = new data.Tweets();

  this.tweetQueue = async.queue( self.sendTweets.bind( self ), 10 );

  async.series([
    self.getFrontPages.bind( self ),
    self.getTweets.bind( self ),
    self.prepareTweets.bind( self )
  ]);

  return this;
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

  tweet.getTweets( this, callback );

};

todaysFrontPage.prototype.prepareTweets = function prepareTweets( callback ) {

  var self = this;

  console.log( 'fetching pages' );

  if ( !this.tweets.length ) {
    async.eachLimit( this.pages.serialize(), 10, processPage, function() {
      console.log( 'processed all the pages' );

      callback();
    });
  }

  function processPage( page, localCallback ) {
    var text = page.title + ' - ' + self.today + ' - ' + page.loc;

    // if ( we cant find `text` in the tweets gathered for the day ) {
    if ( true ) {
      self.tweetQueue.push({
        img: page.src,
        text: text
      }, function( err ) {
        if ( err ) {
          console.log( err );
        }

        console.log( 'sent tweet' );
      });
    }

    localCallback();
  }

};

todaysFrontPage.prototype.sendTweets = function sendTweets( queuedTweet, callback ) {

  console.log( 'sending tweet' );

  request({
    url: queuedTweet.img,
    encoding: 'binary'
  }, encodeImageAndTweet );

  function encodeImageAndTweet( err, res, body ) {
    if ( err ) {
      console.log( err );
    }

    var b64img = new Buffer( body, 'binary' ).toString( 'base64' );

    tweet.update({
      img: b64img,
      text: queuedTweet.text
    }, callback );
  }

};

todaysFrontPage();

