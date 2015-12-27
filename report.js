"use strict";

const strftime = require('strftime');
const _ = require('lodash');
const pluralize = require('pluralize');

function title(data) {
  return `Report Card for ${data.me.name}`
}

function timestamp() {
  return strftime('%B %d, %Y %H:%M')
}

function project_name(data) {
  return `\n*Project ${data.name}*`;
}

function iterationTrends() {
  return "\n===========================\nChanges from last iteration\n===========================";
}

function story_ownership(data) {
  const current = data.story_ownership_counts[0];
  const previous = data.story_ownership_counts[1];

  if (current > previous) {
    return `Number of stories you have owned has increased from ${previous} to ${current}.`
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

function collaborator_count(project) {
  const current = _.keys(project.collaborator_counts[0]).length;
  const previous = _.keys(project.collaborator_counts[1]).length;

  return `You had ${pluralize('collaborator', current, true)} this iteration.`;
}

function top_collaborator(project) {
  const current = project.collaborator_ranks[0];

  if (current.length > 0) {
    return `Your top collaborator was ${current[0].name} with ${pluralize('story', current[0].count, true)} shared.`;
  } else {
    return undefined;
  }
}

function ownership_interestingness(project) {
  if (project.story_ownership_counts[0] > 0 || project.story_ownership_counts[1] > 0) {
    return 1.0;
  } else {
    return 0.0;
  }
}

function aggregated_collaborator_count_interestingness(project) {
  if (_.keys(project.aggregated_collaborator_counts).length > 0) {
    return 1.0;
  }
}

function aggregated_collaborator_count(project) {
  const num_collaborators = _.keys(project.aggregated_collaborator_counts).length;
  const num_collaborations = _.reduce(_.values(project.aggregated_collaborator_counts), function(aggr, num) { return aggr + num; }, 0);

  return `You had ${pluralize('collaborator', num_collaborators, true)} over the last 10 iterations`;
}

function iteration_report(data) {
  var items = [];

  items.push(iterationTrends());
  _.values(data.projects).forEach((project) => {
    if (ownership_interestingness(project) > 0) {
      items.push(project_name(project));
      items.push(story_ownership(project));
      items.push(story_started(project));
      items.push(story_finished(project));
      items.push(story_delivered(project));
      items.push(story_accepted(project));
      items.push(story_rejection(project));

      items.push(collaborator_count(project));
      items.push(top_collaborator(project));
    }
  });

  return items;
}

function collaborator_report(data) {
  let items = [];

  items.push("\n=====================\nCollaborators Report\n=====================");

  _.values(data.projects).forEach((project) => {
    if (aggregated_collaborator_count_interestingness(project) > 0) {
      items.push(project_name(project));
      items.push(aggregated_collaborator_count(project));
    }
  });

  return items
}

module.exports = {
  generate: function(data) {
    var items = [];

    items.push(title(data));
    items.push(timestamp());

    items = items.concat(iteration_report(data));

    items = items.concat(collaborator_report(data));

    return _.compact(items).join("\n");
  }
}
