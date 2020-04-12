const Twit = require("twit");
const dotenv = require("dotenv");
dotenv.config();

const secrets = {
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
};

const twitter = new Twit(secrets);

function tweet(data) {
  return new Promise((resolve, reject) => {
    twitter.post("statuses/update", data, (error, t) => {
      if (error) {
        reject(error);
      } else {
        resolve(t);
      }
    });
  });
}

exports.tweet = tweet;
