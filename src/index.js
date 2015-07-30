'use strict';

var async = require( 'async' );
var cheerio = require( 'cheerio' );
var cron = require( 'node-crontab' );
var request = require( 'request' );
var Twit = require( 'twit' );

var creds = require( '../credentials.js' );

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

  this.T = new Twit( creds );

  this.tweetQueue = async.queue( self.tweet.bind( self ), 10 );

  this.setTodayCron = cron.scheduleJob( '0 0 * * *', function() {
    this.today = new Date().toDateString();
  }, null, self );

  this.frontPageCron = cron.scheduleJob( '58,28 6-20 * * *', self.getFrontPages, null, self );

  this.popularTweetCron = cron.scheduleJob( '0 8-21 * * *', self.sendPopularTweet, null, self );
  this.leastTweetCron = cron.scheduleJob( '30 8-20 * * *', self.sendLeastTweet, null, self );

  async.series([
    self.getTweets.bind( self ),
    self.getFrontPages.bind( self ),
    self.prepareTweets.bind( self )
  ]);

  return this;
};

// TODO: make this a thing
todaysFrontPage.prototype.sendPopularTweet = function() {};
todaysFrontPage.prototype.sendLeastTweet = function() {};

todaysFrontPage.prototype.getTweets = require( './get-tweets.js' );

todaysFrontPage.prototype.tweet = require( './tweet.js' );

todaysFrontPage.prototype.getFrontPages = require( './get-front-pages.js' );

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

todaysFrontPage();

