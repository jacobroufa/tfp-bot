'use strict';

var Twit = require( 'twit' );
var request = require( 'request' );

module.exports = function( creds ) {

  var T = new Twit( creds );

  return function( status ) {

    console.log( 'posting ' + status.text );

    T.post( 'media/upload', { media_data: status.img }, function( err, data, res ) {
      if ( err ) {
        console.log( 'error uploading image to twitter', err, res.statusCode );
      }

      console.log( 'media upload ' + status.img + ' to twitter' );

      var mediaId = data.media_id_string;
      var update = {
        status: status.text,
        media_ids: [mediaId]
      };

      T.post( 'statuses/update', update, function( err, data, res ) {
        console.log( 'posted update to twitter' );
        console.log( err, data, res );
      });
    });

  };

};
