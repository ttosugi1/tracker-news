const _ = require('lodash');

function story_ownership_count(raw) {
  const me_id = raw.me.id;

  var count = 0;
  _.values(raw.iterations).forEach((iteration) => {
    iteration.stories.forEach((story) => {
    if (_.contains(story.owner_ids, me_id)) {
      count += 1;
    }
    });
  });
  return count;
}

module.exports = {
  generate: function(raw) {
    var result = Object.assign({}, raw)
    result.story_ownership_count = story_ownership_count(raw);
    return result;
  }
};
