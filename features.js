const _ = require('lodash');

function story_ownership_count(raw, iterationsBack) {
  return raw.iteration_stories[iterationsBack].reduce((acc, story) => {
    return _.contains(story.owner_ids, raw.me.id) ? acc + 1 : acc;
  }, 0);
}

function story_count_by_state(raw, state, iterationsBack) {
  return raw.iteration_stories[iterationsBack].reduce((acc, story) => {
    return _.contains(story.owner_ids, raw.me.id) && story.current_state == state ?
      acc + 1 : acc;
  }, 0);
}

module.exports = {
  generate: function(raw) {
    var result = Object.assign({}, raw)
    result.story_ownership_counts = [0, 1, 2].map((iterationsBack) => {
      return story_ownership_count(raw, iterationsBack);
    })

    result.story_started_counts = [0, 1, 2].map((iterationsBack) => {
      return story_count_by_state(raw, 'started', iterationsBack);
    });

    result.story_finished_counts = [0, 1, 2].map((iterationsBack) => {
      return story_count_by_state(raw, 'finished', iterationsBack);
    });

    result.story_delivered_counts = [0, 1, 2].map((iterationsBack) => {
      return story_count_by_state(raw, 'delivered', iterationsBack);
    });

    result.story_accepted_counts = [0, 1, 2].map((iterationsBack) => {
      return story_count_by_state(raw, 'accepted', iterationsBack);
    });

    result.story_rejected_counts = [0, 1, 2].map((iterationsBack) => {
      return story_count_by_state(raw, 'rejected', iterationsBack);
    });
    return result;
  }
};
