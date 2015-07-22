'use strict';

var request = require( 'request' );
var cheerio = require( 'cheerio' );

var creds = require( '../credentials.js' );
var tweet = require( './tweet.js' )( creds );


module.exports = function fetchImage( img, callback ) {

  var el = cheerio.load( img );
  var src = el.attr( 'src' ).replace( '/med', '/lg' );
  var title = el.parents( 'p.thumbnail' ).siblings( 'h4' ).text().trim();
  var loc = el.parents( 'p.thumbnail' ).siblings( 'div' ).text().trim();
  var today = new Date();

  request({
    url: src,
    encoding: 'binary'
  }, processImage );

  function processImage( err, res, body ) {
    if ( err ) {
      console.log( err );
    }

    var b64img = new Buffer( body, 'binary' ).toString( 'base64' );

    tweet({
      img: b64img,
      text: title + ' - ' + today.toDateString() + ' - ' + loc
    });

    callback();
  }
};

