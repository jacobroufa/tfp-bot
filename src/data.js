'use strict';

var State = require( 'ampersand-state' );
var Collection = require( 'ampersand-collection' );

var data = function() {
  var Page = State.extend({
    props: {
      src: 'string',
      title: 'string',
      loc: 'string'
    }
  });
  var Pages = Collection.extend({
    model: Page
  });
  var Tweet = State.extend({
    props: {
      id: 'number',
      text: 'string'
    }
  });
  var Tweets = Collection.extend({
    model: Tweet
  });

  return {
    Page: Page,
    Pages: Pages,
    Tweet: Tweet,
    Tweets: Tweets
  };
};

module.exports = data();
