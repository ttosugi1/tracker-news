const _ = require('lodash');

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

function statsByProject(me, project) {
  result = {};
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
  return result;
}

module.exports = {
  generate: function(raw) {
    var result = Object.assign({}, raw);

    _.values(raw.projects).forEach((project) => {
      result.projects[project.id] = Object.assign({}, project, statsByProject(raw.me, project));
    })

    return result;
  }
};
