function title(data) {
  return `Report for ${data.me.name}`
}

function story_ownership(data) {

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
    return title(data)
  }
}
