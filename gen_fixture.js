'use strict';

const fs = require('fs');
const data = require('./data');

let fetchPromise = data.fetch();

fetchPromise.then((value) => {
  let raw = data.get();
  fs.open('fixtures/fixture.js', 'w', function(err, fd) {
    fs.write(fd, JSON.stringify(raw, null, '  '));
  });
}).catch((reason) => {
  console.log(`fetch failed! ${reason}`);
});
