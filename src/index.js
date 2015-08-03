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

  // make sure the queue is available early
  this.tweetQueue = async.queue( self.tweet.bind( self ), 10 );

  this.setTodayCron = cron.scheduleJob( '0 0 * * *', function() {
    this.today = new Date().toDateString();
  }, null, self );

  // TODO: analyze newseum's posting habits -- maybe this only needs to happen a few times?
  this.frontPageCron = cron.scheduleJob( '58,28 6-20 * * *', self.getFrontPages, null, self );

  this.popularTweetCron = cron.scheduleJob( '0 8-21 * * *', self.sendPopularTweet, null, self );
  this.leastTweetCron = cron.scheduleJob( '30 8-20 * * *', self.sendLeastTweet, null, self );

  async.series([
    // do I need to getTweets anymore?
    self.getTweets.bind( self ),
    self.getFrontPages.bind( self )
  ]);

  this.listenForQueries.call( self );

  return this;
};

// TODO: make this a thing
todaysFrontPage.prototype.sendPopularTweet = function() {
  console.log( 'sent popular tweet' );
};
todaysFrontPage.prototype.sendLeastTweet = function() {
  console.log( 'sent least popular tweet' );
};

todaysFrontPage.prototype.getTweets = require( './get-tweets.js' );

todaysFrontPage.prototype.prepareTweet = require( './prepare-tweet.js' );

todaysFrontPage.prototype.tweet = require( './tweet.js' );

todaysFrontPage.prototype.getFrontPages = require( './get-front-pages.js' );

todaysFrontPage.prototype.listenForQueries = require( './listen-for-queries.js' );

todaysFrontPage();

