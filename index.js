const data = require('./data');
const report = require('./report');
const features = require('./features');

data.fetch();

setInterval(function() {
  if (data.loaded()) {
    console.log('=============================================');
    console.log(report.generate(features.generate(data.get())));
    console.log('=============================================');
    process.exit(0);
  } else {
    console.log('waiting for data to load');
  }
}, 1000);
