const strftime = require('strftime');

function title(data) {
  return `Report for ${data.me.name}`
}

function timestamp() {
  return strftime('%B %d, %Y %H:%M')
}

function story_ownership(data) {
  return `For this iteration you owned ${data.story_ownership_count} stories`
}

function story_finished(data) {

}

function story_acceptance(data) {

}

function story_rejection(data) {

}

function story_cycle_time(data) {

}

module.exports = {
  generate: function(data) {
    return [title(data), timestamp(), story_ownership(data)].join("\n");
  }
}
