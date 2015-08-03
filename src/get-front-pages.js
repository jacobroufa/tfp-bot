'use strict';

var async = require( 'async' );
var cheerio = require( 'cheerio' );
var request = require( 'request' );

module.exports = function getFrontPages( callback ) {

  console.log( 'getting the front pages' );

  var numTweets = this.tweets.length;
  var self = this;
  var $;

  request( self.url, getPage );

  function getPage( err, res, body ) {
    if ( err ) {
      console.log( err );
    }

    $ = cheerio.load( body );
    var pages = $( 'p.thumbnail a img' );

    async.eachSeries( pages, savePage, function() {
      console.log( 'got ' + self.pages.length + ' pages of ' + pages.length + ' total' );

      console.log( 'got front pages' );
      // callback();
    });
  }

  function savePage( page, localCallback ) {
    var el = $( page );
    var src = el.attr( 'src' );
    var largeSrc = src.replace( '/med', '/lg' );
    var title = el.parents( 'p.thumbnail' ).siblings( 'h4' ).text().trim();
    var loc = el.parents( 'p.thumbnail' ).siblings( 'div' ).text().trim();

    // TODO: account for pages that already exist in the self.pages collection
    if ( numTweets && !tweeted( title )) {
      addPage( largeSrc, title, loc );
    } else if ( !numTweets ) {
      addPage( largeSrc, title, loc );
    }

    localCallback();
  }

  function tweeted( title ) {
    var hasBeenTweeted = false;

    self.tweets.each( function( tweet ) {
      hasBeenTweeted = ( tweet.text.search( title ) !== -1 );
    });

    return hasBeenTweeted;
  }

  function addPage( src, title, loc ) {
    self.pages.add({
      src: src,
      title: title,
      loc: loc
    });
  }

};
