const strftime = require('strftime');
const _ = require('lodash');

function title(data) {
  return `Report Card for ${data.me.name}`
}

function timestamp() {
  return strftime('%B %d, %Y %H:%M')
}

function iterationTrends() {
  return "\n-------------------------\nChanges from last iteration\n-------------------------";
}

function story_ownership(data) {
  const current = data.story_ownership_counts[0];
  const previous = data.story_ownership_counts[1];

  if (current > previous) {
    return `Number of stories you have owned has increased to ${current} from ${previous}.`
  } else if (current < previous) {
    return `Number of stories you have owned has decreased from ${previous} to ${current}.`
  } else {
    return `Number of stories you have owned stayed steady at ${current}`
  }
}

function story_started(data) {
  if (data.story_started_counts[0] > 0) {
    return `You have ${data.story_started_counts[0]} stories in progress (aka started)`;
  }
  return null;
}

function story_finished(data) {
  if (data.story_finished_counts[0] > 0) {
    return `You have ${data.story_finished_counts[0]} stories in waiting to be deployed (aka finished)`;
  }
  return null;
}

function story_delivered(data) {
  if (data.story_delivered_counts[0] > 0) {
    return `You have ${data.story_delivered_counts[0]} stories in waiting to be accepted (aka delivered)`;
  }
  return null;
}

function story_accepted(data) {
  const current = data.story_accepted_counts[0];
  const previous = data.story_accepted_counts[1];

  if (current > previous) {
    return `More of your stories were accepted from ${previous} to ${current}. Yay!`
  } else if (current < previous) {
    return `Less of your stories were accepted from ${previous} to ${current}. Boo!`
  } else {
    return `The number of story accepted have stayed steady`;
  }
}

function story_rejection(data) {
  const current = data.story_rejected_counts[0];
  const previous = data.story_rejected_counts[1];

  if (current > previous) {
    return `As for number of rejected stories, they have increased from ${previous} to ${current}. Maybe you should do more exploratory testing.`;
  } else if (current < previous) {
    return `As for number of rejected stories, they have decreased from ${previous} to ${current}. Yay!`;
  } else {
    return `The number of story rejections have stayed the same`;
  }
}

module.exports = {
  generate: function(data) {
    return _.compact([
      title(data),
      timestamp(),
      iterationTrends(),
      story_ownership(data),
      story_started(data),
      story_finished(data),
      story_delivered(data),
      story_accepted(data),
      story_rejection(data),
    ]).join("\n");
  }
}
