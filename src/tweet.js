'use strict';

var Twit = require( 'twit' );
var request = require( 'request' );

module.exports = function( creds ) {

  var T = new Twit( creds );

  return function( status, callback ) {

    console.log( 'posting ' + status.text );

    return T.post( 'media/upload', { media_data: status.img }, function( err, data, res ) {
      if ( err ) {
        callback( err );
      }

      var mediaId = data.media_id_string;
      var update = {
        status: status.text,
        media_ids: [mediaId]
      };

      return T.post( 'statuses/update', update, function( err, data, res ) {
        if ( err ) {
          callback( err );
        }

        console.log( 'posted ' + status.text );

        callback();
      });
    });

  };

};
