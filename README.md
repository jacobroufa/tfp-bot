# Today's Front Pages

[@FrontPageBot](https://twitter.com/FrontPageBot)

This bot posts the day's front pages once every day. Content is obtained from [Newseum](http://www.newseum.org/).


## TODO

+ Filter to “top 50” cities (or maybe state capitals?)
  + at 50 cities, we can do one every 14 minutes and have it done in a 12hr period
+ Request a paper -- e.g. tweet city or paper name @FrontPageBot and get the paper return tweeted to you

## Credentials

This bot requires a Twitter API key, as can be found on their [developer site](https://apps.twitter.com/app/new).

`cp credentials.js.default credentials.js`


## Development

`npm run dev` will run a watcher that will hint your source code.


## Deployment


Add this line to your crontab, changing the path or time as necessary `0 09 * * * node /path/to/tfp-bot/src/index.js`.


## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwaldron/idiomatic.js), by maintaining the existing coding style. Add unit tests for any new or changed functionality.


## License
Copyright (c) 2015 Jacob Roufa <jacob.roufa@gmail.com>
Licensed under the MIT license.
