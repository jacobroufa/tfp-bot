'use strict';

// TODO: make this more generic
// I don't want to have to call it with the page object every time
module.exports = function prepareTweet( page, callback ) {

  var self = this;
  var mentions = page.mentions.reduce( function( res, mention ) {
    return res + mention + ' ';
  }, '' ) || '';
  var text = mentions + page.title + ' - ' + self.today + ' - ' + page.loc;

  var tweet = {
    img: page.src,
    text: text
  };

  if ( mentions ) {
    tweet.replyTo = page.replyTo;
  }

  self.tweetQueue.push( tweet, function( err ) {
    if ( err ) {
      console.log( err );
    }

    console.log( 'sent tweet' );

    callback();
  });

};
