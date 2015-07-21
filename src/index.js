'use strict';

var request = require( 'request' );
var cheerio = require( 'cheerio' );
var sleep = require( 'sleep' );

var creds = require( '../credentials.js' );
var tweet = require( './tweet.js' )( creds );


var url = 'http://www.newseum.org/todaysfrontpages/?tfp_show=all';


request( url, getPage );


function getPage( err, res, body ) {

  if ( err ) {
    return console.log( 'error getting front pages listing', err, res.statusCode );
  }

  console.log( 'got front pages' );

  var $ = cheerio.load( body );
  var imgs = $( 'p.thumbnail a img' );

  imgs.each( function() {

    var el = $( this );
    var src = el.attr( 'src' );
    var largeSrc = src.replace( '/med', '/lg' );
    var title = el.parents( 'p.thumbnail' ).siblings( 'h4' ).text().trim();
    var loc = el.parents( 'p.thumbnail' ).siblings( 'div' ).text().trim();
    var today = new Date();

    request( largeSrc, function( err, res, data ) {
      if ( err ) {
        console.log( 'error getting ' + largeSrc, err, res.statusCode );
      }

      console.log( 'got image' );

      var b64img = new Buffer( data ).toString( 'base64' );

      tweet({
        img: b64img,
        text: title + ' - ' + today.toDateString() + ' - ' + loc
      });
    });

  });

}


