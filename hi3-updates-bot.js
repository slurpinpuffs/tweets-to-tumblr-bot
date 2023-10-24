//Tumblr side:
// Authenticate via OAuth
const tumblr = require('tumblr.js');
const client = tumblr.createClient({
  consumer_key: '0SFWclyhmVGgXZbPqRmhYicSaaCldaImLWGKM2o7b5HJZtpAi6',
  consumer_secret: 'kyyHDFqFcCd3wmRsatSpD2CrdHy2aGifeENFnivChMCn3E8gLp',
  token: 'fZlJjjUEt7UmZ3VqtB5SJxTsQ1xK238H0MQEdQDu6ZzSioOlnV',
  token_secret: 'p0rs2YrN7txFuQQ4A2dxPRrH8nsdds1nQ3pl51UGdeLxBUYG0y'
});
const tumblrTags = ["hi3 updates", "honkai impact 3rd updates", "hi3", "honkai impact 3rd"];

const https = require('https');
// url of RSS feed set to .JSON file
let url = "https://rss.app/feeds/v1.1/GxXVByw2nO2W0FL7.json";
const fs = require('fs');

let latestTweet;
let lastUpdateLocation = __dirname + '/last_update.txt';

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
        console.log(latestTweet.title);

        fs.readFile(lastUpdateLocation, (err, data) => {
          if(err) throw err;
          if(data == latestTweet.url){
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
  // Deletes '@HonkaiImpact3rd' from tweet content
  let tweetText = tweet.title.substring(18);

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
        createTextPostWithImage('hi3-updates', tweetText, tweet.url, savedImagePath);
      });
    }).on('error', err => {
      fs.unlink(imageName);
      console.error(`Error downloading image: ${err.message}`);
    });
  }else{
    // Posts to Tumblr without image
    createTextPost('hi3-updates', tweetText, tweet.url);
  }

  // Saves link of input tweet to file
  fs.writeFile(lastUpdateLocation, tweet.url, function(err) {
    if(err){
      return console.log(err);
    }
    console.log("File saved!");
  });
}

checkForTweet();