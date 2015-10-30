const HEADERS = {
  'X-TrackerToken': process.env.TRACKER_TOKEN
};

const request = require('request');

function fetchMe() {
  const options = {
    url: 'https://www.pivotaltracker.com/services/v5/me',
    headers: HEADERS
  }

  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      console.log(body);
    }
  });
}

module.exports = {
  fetch: function() {
    fetchMe();
  }
}
