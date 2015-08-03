# Today's Front Pages

[@FrontPageBot](https://twitter.com/FrontPageBot)

This bot posts the day's front pages once every day. Content is obtained from [Newseum](http://www.newseum.org/).


## TODO

+ Build two lists of tweets that alternately get tweeted on the half hour -- most popular, least popular
  + Most popular tweets are refined by # of retweets, favs and requests
  + Least popular tweets are randomly chosen from list of lowest ranked
  + Most popular are initially ranked by [circulation](https://en.wikipedia.org/wiki/List_of_newspapers_in_the_United_States_by_circulation)
+ Request a paper by city/state (request by paper name initially complete)
+ Reply to multiple Twitter users
+ Research newseum’s posting schedule
+ Add state via database of some sort, and account for that when fetching tweets/pages

## Credentials

This bot requires a Twitter API key, as can be found on their [developer site](https://apps.twitter.com/app/new).

`cp credentials.js.default credentials.js`


## Development

`npm run dev` will run a watcher that will hint your source code.


## Deployment

Deploy using [forever](https://www.npmjs.com/package/forever) to ensure the process stays alive.


## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwaldron/idiomatic.js), by maintaining the existing coding style. Add unit tests for any new or changed functionality.


## License
Copyright (c) 2015 Jacob Roufa <jacob.roufa@gmail.com>
Licensed under the MIT license.
