'use strict';

var Twit = require( 'twit' );
var async = require( 'async' );

module.exports = function tweet( creds ) {

  var T = new Twit( creds );

  return {
    getTweets: function getTweets( context, callback ) {

      var returnedTweets;
      var existingTweets = context.tweets.length;
      var self = this;

      T.get( 'statuses/home_timeline', {
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

        if ( datestamp == context.today ) {
          context.tweets.add({
            id: status.id,
            text: status.text
          });
        }

        localCallback();
      }

      function loopOrCallback() {
        var processedTweets = context.tweets.length - existingTweets;

        console.log( 'processed ' + processedTweets + ' tweets' );

        if ( processedTweets < returnedTweets ) {
          console.log( 'processed ' + context.tweets.length + ' tweets total' );

          callback();
        } else {
          getTweets( context, callback );
        }

      }
    },
    update: function update( status, callback ) {

      console.log( 'posting ' + status.text );

      return T.post( 'media/upload', { media_data: status.img }, function( err, data, res ) {
        if ( err ) {
          console.log( err );
        }

        var mediaId = data.media_id_string;
        var update = {
          status: status.text,
          media_ids: [mediaId]
        };

        return T.post( 'statuses/update', update, function( err, data, res ) {
          if ( err ) {
            console.log( err );
          }

          console.log( 'posted ' + status.text );

          callback();
        });
      });

    }
  };

};
