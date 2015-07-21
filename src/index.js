'use strict';

var request = require( 'request' );
var cheerio = require( 'cheerio' );
var async = require( 'async' );

var creds = require( '../credentials.js' );
var tweet = require( './tweet.js' )( creds );


var url = 'http://www.newseum.org/todaysfrontpages/?tfp_show=all';


request( url, getPage );


function getPage( err, res, body ) {

  if ( err ) {
    throw err;
  }

  var $ = cheerio.load( body );
  var imgs = $( 'p.thumbnail a img' );

  async.eachSeries( imgs, function( img, callback ) {

    var el = $( img );
    var src = el.attr( 'src' );
    var largeSrc = src.replace( '/med', '/lg' );
    var title = el.parents( 'p.thumbnail' ).siblings( 'h4' ).text().trim();
    var loc = el.parents( 'p.thumbnail' ).siblings( 'div' ).text().trim();
    var today = new Date();

    request({
      url: largeSrc,
      encoding: 'binary'
    }, function( err, res, body ) {
      if ( err ) {
        callback( err );
      }

      var b64img = new Buffer( body, 'binary' ).toString( 'base64' );

      tweet({
        img: b64img,
        text: title + ' - ' + today.toDateString() + ' - ' + loc
      });
    });

    callback();

  });

}


