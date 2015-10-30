const _ = require('lodash');

function story_ownership_count(raw, iterationsBack) {
  return raw.iteration_stories[iterationsBack].reduce((acc, story) => {
    return _.contains(story.owner_ids, raw.me.id) ? acc + 1 : acc;
  }, 0);
}

function story_count_by_state(raw, state) {
  return raw.current_iteration_stories.reduce((acc, story) => {
    return _.contains(story.owner_ids, raw.me.id) && story.current_state == state ?
      acc + 1 : acc;
  }, 0);
}

module.exports = {
  generate: function(raw) {
    var result = Object.assign({}, raw)
    result.story_ownership_count = story_ownership_count(raw, 0);
    result.story_ownership_counts = [0, 1, 2].map((iterationsBack) => {
      return story_ownership_count(raw, iterationsBack);
    })
    result.story_acceptance_count = story_count_by_state(raw, 'accepted');
    result.story_rejected_count = story_count_by_state(raw, 'rejected');
    result.story_finished_count = story_count_by_state(raw, 'finished');
    result.story_started_count = story_count_by_state(raw, 'started');
    return result;
  }
};
