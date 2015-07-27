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

  this.tweetLimit = 50;
  this.tweetCount = 0;

  this.tweetQueue = async.queue( self.sendTweets.bind( self ), 10 );

  async.series([
    self.getTweets.bind( self ),
    self.getFrontPages.bind( self ),
    self.prepareTweets.bind( self )
  ]);

  return this;
};


todaysFrontPage.prototype.getTweets = function getTweets( callback ) {

  console.log( 'getting tweets' );

  tweet.getTweets( this, callback );

};

todaysFrontPage.prototype.getFrontPages = function getFrontPages( callback ) {

  var self = this;
  var numTweets = self.tweets.length;

  console.log( 'getting the front pages' );

  request( self.url, getPage );

  function getPage( err, res, body ) {
    if ( err ) {
      console.log( err );
    }

    var $ = cheerio.load( body );
    var pages = $( 'p.thumbnail a img' );

    async.eachSeries( pages, savePage, function() {
      console.log( 'got ' + self.pages.length + ' pages of ' + pages.length + ' total' );

      callback();
    });

    function savePage( page, localCallback ) {
      var el = $( page );
      var src = el.attr( 'src' );
      var largeSrc = src.replace( '/med', '/lg' );
      var title = el.parents( 'p.thumbnail' ).siblings( 'h4' ).text().trim();
      var loc = el.parents( 'p.thumbnail' ).siblings( 'div' ).text().trim();

      if ( numTweets && !tweeted( title )) {
        addPage();
      } else if ( !numTweets ) {
        addPage();
      }

      localCallback();

      function addPage() {
        self.pages.add({
          src: largeSrc,
          title: title,
          loc: loc
        });
      }
    }
  }

  function tweeted( title ) {
    var hasBeenTweeted = false;

    self.tweets.each( function( tweet ) {
      if ( tweet.text.search( title ) !== -1 ) {
        hasBeenTweeted = true;
      }
    });

    return hasBeenTweeted;
  }

};

todaysFrontPage.prototype.prepareTweets = function prepareTweets( callback ) {

  var self = this;

  console.log( 'preparing tweets' );

  async.eachSeries( this.pages.serialize(), processPage, function() {
    console.log( 'prepared all the tweets' );

    callback();
  });

  function processPage( page, localCallback ) {
    var text = page.title + ' - ' + self.today + ' - ' + page.loc;

    if ( self.tweetCount < self.tweetLimit ) {
      self.tweetQueue.push({
        img: page.src,
        text: text
      }, function( err ) {
        if ( err ) {
          console.log( err );
        }

        console.log( 'sent tweet' );

        setTimeout( function() {
          localCallback();
        }, 15000 );
      });

      self.tweetCount++;
    } else {
      callback();
    }
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

