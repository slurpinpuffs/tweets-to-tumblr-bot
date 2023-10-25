const tumblr = require('tumblr.js');
const fs = require('fs');
const https = require('https');
// Authenticate Tumblr acc via OAuth
const client = tumblr.createClient({
  consumer_key: '',
  consumer_secret: '',
  token: '',
  token_secret: ''
});
const blogToPost = 'example-blog-name';
const tumblrTags = ["list", "tags", "here"];

// url of RSS feed set to .JSON file
let url = "https://rss.app/feeds/v1.1/example.json";

let latestTweet;
let lastUpdateLocation = __dirname + '/last_update.txt';
let date = new Date()

// Used to delete the name when posting tweet
let twitterHandle = '@HonkaiImpact3rd';

async function getBlogInfo(blogName){
  // Make the request
  var response = await client.blogInfo(blogName);
  return response;
}

async function createTextPost(blogName, text, sourceUrl){
  await client.createPost(blogName, {
      content: [
        {
          type: 'text',
          text: text,
        },
        {
          type: 'text',
          text: 'Original Tweet',
          formatting: [
            {
              start: 0,
              end: 14,
              type: 'link',
              url: sourceUrl
            }
          ]
        }
      ],
      tags: tumblrTags
    }
  );
}

async function createTextPostWithImage(blogName, text, sourceUrl, mediaUrl){
  await client.createPost(blogName, {
      content: [
        {
          type: 'text',
          text: text,
        },
        {
          type: 'image',
          media: fs.createReadStream(mediaUrl),
        },
        {
          type: 'text',
          text: 'Original Tweet',
          formatting: [
            {
              start: 0,
              end: 14,
              type: 'link',
              url: sourceUrl
            }
          ]
        }
      ],
      tags: tumblrTags
    }
  );
}

async function checkForTweet(){
  // Checks for the latest tweet in RSS feed and compares its link to the last saved link in file

  let json;

  https.get(url, (res) => {
    let body = "";
  
    res.on("data", (chunk) => {
      body += chunk;
    });
  
    res.on("end", () => {
      try{
        json = JSON.parse(body);
        latestTweet = json.items[0];

        fs.readFile(lastUpdateLocation, (err, data) => {
          if(err) throw err;
          if(data == latestTweet.url){
            console.log(`${new Date().toString()}:`);
            console.log("Tweet already posted!");
          }else{
            postToTumblr(latestTweet);
          }
        });
      } catch (error){
        console.error(error.message);
      };
    });
  }).on("error", (error) => {
    console.error(error.message);
  });
};

function postToTumblr(tweet){
  // Deletes Twitter handle from tweet content
  let tweetText = tweet.title.substring(twitterHandle.length + 2);

  // Checks for image
  if(tweet.image != null){
    // Posts to Tumblr with image
    let imageUrl = tweet.image;
    let savedImagePath = __dirname + '/image.jpg';
    let file = fs.createWriteStream(savedImagePath);

    https.get(imageUrl, response => {
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        createTextPostWithImage(blogToPost, tweetText, tweet.url, savedImagePath);
      });
    }).on('error', err => {
      fs.unlink(imageName);
      console.error(`Error downloading image: ${err.message}`);
    });
  }else{
    // Posts to Tumblr without image
    createTextPost(blogToPost, tweetText, tweet.url);
  }

  // Logs post to console
  console.log(`${new Date().toString()}:`);
  console.log(`Posted:\n${tweetText}`);

  // Saves link of input tweet to file
  fs.writeFile(lastUpdateLocation, tweet.url, function(err) {
    if(err){
      return console.log(err);
    }
    console.log("File saved!");
  });
}

checkForTweet();
// Checks for updates every 10 seconds after launch
setInterval(checkForTweet, 10000);