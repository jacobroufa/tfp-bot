'use strict';

// TODO: make this more generic
// I don't want to have to call it with the page object every time
module.exports = function prepareTweet( page, callback ) {

  var self = this;
  var mentions = page.mentions + ' ' || '';
  var text = mentions + page.title + ' - ' + self.today + ' - ' + page.loc;

  self.tweetQueue.push({
    img: page.src,
    text: text
  }, function( err ) {
    if ( err ) {
      console.log( err );
    }

    console.log( 'sent tweet' );

    callback();
  });

};
