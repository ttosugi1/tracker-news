"use strict";

const data = require('./data');
const report = require('./report');
const features = require('./features');

let fetchPromise = data.fetch();
let done = false;

fetchPromise.then((value) => {
  console.log('=============================================');
  console.log(report.generate(features.generate(data.get())));
  console.log('=============================================');

  done = true;
}, (reason) => {
  console.log(`fetch failed! ${reason}`);
  done = true;
})

setInterval(() => {
  if (done) {
    process.exit(0);
  } else {
    console.log('waiting for data to load');
  }
}, 1000);
