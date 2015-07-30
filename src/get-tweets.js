'use strict';

var async = require( 'async' );

module.exports = function getTweets( callback ) {

  console.log( 'getting tweets' );

  var returnedTweets;
  var existingTweets = this.tweets.length;
  var self = this;

  this.T.get( 'statuses/home_timeline', {
    count: 200,
    trim_user: true,
    exclude_replies: true
  }, processTweets );

  function processTweets( err, data, res ) {
    if ( err ) {
      console.log( err );
    }

    // save this, because there could be less than `count` returned
    returnedTweets = data.length;

    console.log( 'returned ' + returnedTweets + ' tweets' );

    async.each( data, processTweet, loopOrCallback );
  }

  function processTweet( status, localCallback ) {
    var datestamp = new Date( status.created_at ).toDateString();

    if ( datestamp == self.today ) {
      self.tweets.add({
        id: status.id,
        text: status.text
      });
    }

    localCallback();
  }

  function loopOrCallback() {
    var processedTweets = self.tweets.length - existingTweets;

    console.log( 'processed ' + processedTweets + ' tweets' );

    if ( processedTweets < returnedTweets ) {
      console.log( 'processed ' + self.tweets.length + ' tweets total' );

      callback();
    } else {
      getTweets.call( self, callback );
    }

  }
};
