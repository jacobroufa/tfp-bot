'use strict';

var request = require( 'request' );
var cheerio = require( 'cheerio' );
var async = require( 'async' );

var image = require( './image.js' );


request( 'http://www.newseum.org/todaysfrontpages/?tfp_show=all', getPage );


function getPage( err, res, body ) {

  if ( err ) {
    throw err;
  }

  var $ = cheerio.load( body );
  var imgs = $( 'p.thumbnail a img' );

  async.eachLimit( imgs, 10, image );

}

