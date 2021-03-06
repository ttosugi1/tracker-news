"use strict";

const _ = require('lodash');
const R = require('ramda');

function story_ownership_count(me, iteration_stories, iterationsBack) {
  if (iterationsBack < iteration_stories.length) {
    return iteration_stories[iterationsBack].reduce((acc, story) => {
      return _.contains(story.owner_ids, me.id) ? acc + 1 : acc;
    }, 0);
  } else {
    return 0;
  }
}

function story_count_by_state(me, iteration_stories, state, iterationsBack) {
  if (iterationsBack < iteration_stories.length) {
    return iteration_stories[iterationsBack].reduce((acc, story) => {
      return _.contains(story.owner_ids, me.id) && story.current_state == state ?
        acc + 1 : acc;
    }, 0);
  } else {
    return 0;
  }
}

function collaborator_count(me, iteration_stories, iterationsBack) {
  let count = {};

  if (iterationsBack < iteration_stories.length) {
    iteration_stories[iterationsBack].forEach((story) => {
      if (_.contains(story.owner_ids, me.id)) {
        story.owner_ids.forEach((ownerId) => {
          if (me.id != ownerId) {
            if (count[ownerId]) {
              count[ownerId]++;
            } else {
              count[ownerId] = 1;
            }
          }
        });
      }
    });
  }

  return count;
}

function aggregated_collaborator_counts(me, iteration_stories) {
  let count = {};

  for (let iterationsBack = 0; iterationsBack < iteration_stories.length; iterationsBack++) {
    let iterationsBackStories = iteration_stories[iterationsBack];
    iterationsBackStories.forEach((story) => {
      if (_.contains(story.owner_ids, me.id)) {
        story.owner_ids.forEach((ownerId) => {
          if (me.id != ownerId) {
            if (count[ownerId]) {
              count[ownerId]++;
            } else {
              count[ownerId] = 1;
            }
          }
        });
      }
    });
  }

  return count;
}

function collaborator_rank(collaborator_count, personMap) {
  const topCollaborators = _.chain(collaborator_count).pairs().sortBy(item => item[1]).reverse().value();
  const result = topCollaborators.map((item) => {
    return {name: personMap[item[0]].name, count: item[1]};
  });
  return result;
}

function story_requested_counts(project, personMap) {
  let counts = {};

  project.iteration_stories.forEach((stories) => {
    stories.forEach((story) => {
      const requestedById = story.requested_by_id;

      if (counts[requestedById]) {
        counts[requestedById]++;
      } else {
        counts[requestedById] = 1;
      }
    });
  });

  let ret = [];
  for (var key in counts) {
    let person = personMap[key];
    let name = (person || {name: 'N/A'}).name;
    ret.push({person_id: parseInt(key, 10), count: counts[key], name: name});
  }
  return ret;
}

function story_requested_count_mean(counts) {
  return R.mean(R.map(R.prop('count'), counts));
}

function story_requested_count_median(counts) {
  return R.median(R.map(R.prop('count'), counts));
}

function statsByProject(me, project, personMap) {
  let result = {};
  result.story_ownership_counts = [0, 1, 2].map((iterationsBack) => {
    return story_ownership_count(me, project.iteration_stories, iterationsBack);
  })

  result.story_started_counts = [0, 1, 2].map((iterationsBack) => {
    return story_count_by_state(me, project.iteration_stories, 'started', iterationsBack);
  });

  result.story_finished_counts = [0, 1, 2].map((iterationsBack) => {
    return story_count_by_state(me, project.iteration_stories, 'finished', iterationsBack);
  });

  result.story_delivered_counts = [0, 1, 2].map((iterationsBack) => {
    return story_count_by_state(me, project.iteration_stories, 'delivered', iterationsBack);
  });

  result.story_accepted_counts = [0, 1, 2].map((iterationsBack) => {
    return story_count_by_state(me, project.iteration_stories, 'accepted', iterationsBack);
  });

  result.story_rejected_counts = [0, 1, 2].map((iterationsBack) => {
    return story_count_by_state(me, project.iteration_stories, 'rejected', iterationsBack);
  });

  result.collaborator_counts = [0, 1, 2].map((iterationsBack) => {
    return collaborator_count(me, project.iteration_stories, iterationsBack);
  });

  result.collaborator_ranks = [0, 1, 2].map((iterationsBack) => {
    return collaborator_rank(result.collaborator_counts[iterationsBack], personMap);
  });

  result.aggregated_collaborator_counts = aggregated_collaborator_counts(me, project.iteration_stories);

  result.iteration_count = project.iteration_stories.length;

  result.story_requested_counts = story_requested_counts(project, personMap),

  result.story_requested_stats = {
    mean: story_requested_count_mean(result.story_requested_counts),
    median: story_requested_count_median(result.story_requested_counts),
  };

  return result;
}

module.exports = {
  generate: function(raw) {
    let result = Object.assign({}, raw);

    _.values(raw.projects).forEach((project) => {
      result.projects[project.id] = Object.assign({}, project,
        statsByProject(raw.me, project, raw.personMap));
    })

    return result;
  }
};
