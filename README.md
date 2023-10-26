# tweets-to-tumblr-bot
Node.js bot that gets latest Tweets from a Twitter profile via RSS feed, uploads to Tumblr automatically.
Checks for updates every 10 seconds after start. To change this, change the millisecondsToWait variable in index.js.

To use, download files, change the 5 variables in index.js that are marked "CHANGE THIS:", then run index.js.

Current Limitations:
- Tweets with multiple images will be posted with just the first one
- Tweets with links in them will have them mysteriously disappear 
- Can’t automatically post videos
- Can’t catch Tweets if multiple are made at the same time
- Not great with replies
