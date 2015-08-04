'use strict';

module.exports = function listenForQueries() {

  var self = this;

  console.log( 'listening...' );

  var stream = self.T.stream( 'user' );

  stream.on( 'tweet', respondToTweet );

  function respondToTweet( tweet ) {
    if ( tweet.user.screen_name !== 'FrontPageBot' ) {

      // TODO: filter out other screen names and add to replyTo
      var inquiry = tweet.text.replace( /@FrontPageBot /i, '', 'i');
      var replyTo = '@' + tweet.user.screen_name;

      var page = self.pages.filter( function findPageMatch( page ) {
        var titleMatchRegex = new RegExp( inquiry, 'gi' );

        return ( page.title.search( titleMatchRegex ) >= 0 );
      });

      console.log( tweet.text, page );

      if ( page.length > 0 ) {
        self.prepareTweet({
          title: page[0].title,
          src: page[0].src,
          loc: page[0].loc,
          mentions: replyTo,
          replyTo: tweet.id
        }, function(){});
      } else {
        console.log( inquiry );
      }

    }
  }

};
