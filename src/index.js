const snowflake = require("./snowflake");
const twitter = require("./twitter");

async function post(lastId, delay = 600, count = 33) {
  if (count <= 0) return;

  console.log(count);

  const prevTweetInfo = snowflake.parse(lastId);
  const secondTweetIdGuess = snowflake.create({
    sequence: 0,
    workerId: prevTweetInfo.workerId,
    datacenterId: prevTweetInfo.datacenterId,
    timestamp: prevTweetInfo.timestamp + delay,
  });

  const firstTweet = await twitter.tweet({
    status:
      status1 +
      `➡️ https://twitter.com/mauritscorneIis/status/${secondTweetIdGuess} ➡️`,
    // attachment_url: `https://twitter.com/mauritscorneIis/status/${secondTweetIdGuess}`,
  });

  const secondTweet = await twitter.tweet({
    status:
      status2 +
      `➡️ https://twitter.com/mauritscorneIis/status/${firstTweet.id_str} ➡️`,
    // attachment_url: `https://twitter.com/mauritscorneIis/status/${firstTweet.id_str}`,
  });

  const secondTweetInfo = snowflake.parse(secondTweet.id_str);

  const newDelay = secondTweetInfo.timestamp - prevTweetInfo.timestamp;
  const [stats, success] = getStats(secondTweetIdGuess, secondTweet.id_str);

  const statsTweet = await twitter.tweet({
    status: stats,
    in_reply_to_status_id: secondTweet.id_str,
  });

  if (success) {
    return;
  }

  return await post(statsTweet.id_str, newDelay, count - 1);
}

async function start() {
  const testTweet = await twitter.tweet({
    status: Date.now(),
  });
  post(testTweet.id_str);
}

function getStats(guessedId, realId) {
  const guessedInfo = snowflake.parse(guessedId);
  const realInfo = snowflake.parse(realId);
  const sequenceMatch = realInfo.sequence == guessedInfo.sequence;
  const sequenceLine = `📋${
    sequenceMatch ? `✅` : `❌`
  } ${realInfo.sequence
    .toString()
    .padStart(2, "0")} | ${guessedInfo.sequence.toString().padStart(2, "0")}`;

  const workerIdMatch = guessedInfo.workerId == realInfo.workerId;
  const workerIdLine = `⚙️${
    workerIdMatch ? `✅` : `❌`
  } ${realInfo.workerId
    .toString()
    .padStart(2, "0")} | ${guessedInfo.workerId.toString().padStart(2, "0")}`;

  const datacenterIdMatch = guessedInfo.datacenterId == realInfo.datacenterId;
  const datacenterIdLine = `🏭${
    datacenterIdMatch ? `✅` : `❌`
  } ${realInfo.datacenterId
    .toString()
    .padStart(2, "0")} | ${guessedInfo.datacenterId
    .toString()
    .padStart(2, "0")}`;

  const timestampMatch = guessedInfo.timestamp == realInfo.timestamp;
  const timestampLine = `⏱️${timestampMatch ? `✅` : `❌`} ${
    realInfo.timestamp - guessedInfo.timestamp
  }ms`;

  let status = `${sequenceLine}
${workerIdLine}
${datacenterIdLine}
${timestampLine}
  `;

  console.log(status);

  const success =
    sequenceMatch && workerIdMatch && datacenterIdMatch && timestampMatch;
  if (success) {
    status += `
  🎉🎉 We did it @pomber! 🎉🎉`;
  }

  return [status, success];
}

const status2 = `⬜️⬜️⬜️⬜️⬜️⬜️
⬜️⬜️⬛️⬛️⬜️⬜️
⬜️⬛️⬜️⬜️⬜️⬜️
⬜️⬜️⬜️⬜️⬛️⬜️
⬜️⬜️⬛️⬛️⬜️⬜️
⬜️⬜️⬜️⬜️⬜️⬜️
`;

const status1 = `⬜️⬜️⬜️⬜️⬜️⬜️
⬜️⬜️⬛️⬜️⬜️⬜️
⬜️⬜️⬛️⬛️⬜️⬜️
⬜️⬜️⬛️⬛️⬜️⬜️
⬜️⬜️⬜️⬛️⬜️⬜️
⬜️⬜️⬜️⬜️⬜️⬜️
`;

exports.start = start;
