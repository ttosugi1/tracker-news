const strftime = require('strftime');

function title(data) {
  return `Report for ${data.me.name}`
}

function timestamp() {
  return strftime('%B %d, %Y %H:%M')
}

function story_ownership(data) {
  const current = data.story_ownership_counts[0];
  const previous = data.story_ownership_counts[1];

  if (current > previous) {
    return `Number of stories you have owned has increased to ${current} from ${previous}.`
  } else if (current < previous) {
    return `Number of stories you have owned has decreased from ${previous} to ${current}.`
  } else {
    return `Number of stories you has stayed steady at ${current}`
  }
}

function story_started(data) {
  return `For this iteration ${data.story_finished_count} stories you owned were started`
}

function story_finished(data) {
  return `For this iteration ${data.story_finished_count} stories you owned were finished`
}

function story_acceptance(data) {
  return `For this iteration ${data.story_acceptance_count} stories you owned were accepted`
}

function story_rejection(data) {
  return `For this iteration ${data.story_rejected_count} stories you owned were rejected`
}

function story_cycle_time(data) {

}

module.exports = {
  generate: function(data) {
    return [
      title(data),
      timestamp(),
      story_ownership(data),
      story_started(data),
      story_finished(data),
      story_acceptance(data),
      story_rejection(data),
    ].join("\n");
  }
}
