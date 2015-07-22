'use strict';

var Twit = require( 'twit' );
var request = require( 'request' );
var async = require( 'async' );

module.exports = function tweet( creds ) {

  var T = new Twit( creds );

  return function( status ) {

    return async.series([
      function( callback ) {
        console.log( 'posting ' + status.text );

        callback();
      },
      function( callback ) {
        T.post( 'media/upload', { media_data: status.img }, function( err, data, res ) {
          if ( err ) {
            console.log( err );
          }

          var mediaId = data.media_id_string;
          var update = {
            status: status.text,
            media_ids: [mediaId]
          };

          callback( null, update );
        });
      }
    ], function( err, res ) {
      T.post( 'statuses/update', res[0], function( err, data, res ) {
        if ( err ) {
          console.log( err );
        }

        console.log( 'posted ' + status.text );
      });
    });


  };

};
