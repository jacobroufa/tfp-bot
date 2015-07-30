'use strict';

var async = require( 'async' );
var request = require( 'request' );

module.exports = function tweet( queuedTweet, callback ) {

  var self = this;

  if ( queuedTweet.img ) {
    request({
      url: queuedTweet.img,
      encoding: 'binary'
    }, encodeImageAndTweet );
  } else {
    sendTweet( queuedTweet.text, callback );
  }

  function encodeImageAndTweet( err, res, body ) {
    if ( err ) {
      console.log( err );
    }

    var b64img = new Buffer( body, 'binary' ).toString( 'base64' );

    sendTweet({
      img: b64img,
      text: queuedTweet.text
    }, callback );
  }

  function sendTweet( status, callback ) {

    var statusHasImage = ( typeof status === 'object' );
    var text = ( statusHasImage ? status.text : status );

    console.log( 'posting ' + text );

    return statusHasImage ?
      self.T.post( 'media/upload', { media_data: status.img }, uploadImage ) :
      postUpdate({ status: status }, postUpdateCallback );

    function uploadImage( err, data, res ) {
      if ( err ) {
        console.log( err );
      }

      var mediaId = data.media_id_string;
      var update = {
        status: status.text,
        media_ids: [mediaId]
      };

      return postUpdate( update, postUpdateCallback );
    }

    function postUpdate( update, callback ) {
      return self.T.post( 'statuses/update', update, callback );
    }

    function postUpdateCallback( err, data, res ) {
      if ( err ) {
        console.log( err );
      }

      console.log( 'posted ' + text );

      return callback();
    }

  }

};
