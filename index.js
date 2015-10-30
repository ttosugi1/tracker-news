data = require('./data');
report = require('./report');

data.fetch();

setInterval(function() {
  if (data.loaded()) {
    console.log(report.generate(data.get()));
    process.exit(0);
  } else {
    console.log('waiting for data to load');
  }
}, 1000)

