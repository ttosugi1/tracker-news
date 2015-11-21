"use strict";

const data = require('./data');
const report = require('./report');
const features = require('./features');

let fetchPromise = data.fetch();

fetchPromise.then((value) => {
  console.log('=============================================');
  console.log(report.generate(features.generate(data.get())));
  console.log('=============================================');
}).catch((reason) => {
  console.log(`fetch failed! ${reason}`);
});
