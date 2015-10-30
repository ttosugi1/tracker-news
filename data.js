const request = require('request');
const helpers = require('./helpers');
const _ = require('lodash');

const HEADERS = {
  'X-TrackerToken': process.env.TRACKER_TOKEN
};

const BASE_URI = 'https://www.pivotaltracker.com/services/v5'

var me_ = {};
var projects_ = {};
var stories_ = {};
var iterations_ = {};
var current_iteration_stories_ = [];
var iteration_stories_ = [];

var loaded_ = null;

function fetchMe(callback) {
  const options = {
    url: `${BASE_URI}/me`,
    headers: HEADERS
  }

  console.log(`fetchMe`);

  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      me_ = JSON.parse(body);
      callback();
    }
  });
}

function fetchProject(project_id) {
  const options = {
    url: `${BASE_URI}/projects/${project_id}`,
    headers: HEADERS
  }

  console.log(`fetchProject ${project_id}`);

  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const project = JSON.parse(body);
      projects_[project_id] = project;
      loaded_[project_id].project = true;
    }
  });
}

function fetchProjects(project_ids) {
  project_ids.forEach((project_id) => {
    fetchProject(project_id);
  })
};

function fetchStories(project_id, start_date, end_date) {
  const options = {
    url: `${BASE_URI}/projects/${project_id}/stories`,
    headers: HEADERS
  }

  console.log(`fetchStories ${project_id}`);

  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const stories = JSON.parse(body);
      stories_[project_id] = stories;
      loaded_[project_id].stories = true;
    }
  });
}

function fetchIterations(project_id) {
  const options = {
    url: `${BASE_URI}/projects/${project_id}/iterations`,
    qs: {
      offset: -3,
      scope: 'done_current'
    },
    headers: HEADERS
  }

  console.log(`fetchIterations ${project_id}`);

  request(options, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const iterations = JSON.parse(body);
      const reverseIterations = iterations.reverse()

      if (reverseIterations.length > 0) {
        iterations_[project_id] = reverseIterations;

        reverseIterations.forEach((current_iteration) => {
          stories = [];

          current_iteration.stories.forEach((story) => {
            stories.push(story);
          });

          iteration_stories_.push(stories);
        });

        current_iteration_stories_ = iteration_stories_[0];
      } else {
        console.log('weird issue with api?')
      }

      loaded_[project_id].iterations = true;
    } else {
      console.log(response.statusCode)
    }
  });
}

function loaded() {
  if (loaded_ === null) {
    return false;
  }

  for (var projectId in loaded_) {
    if (loaded_[projectId].project === false ||
          loaded_[projectId].iterations === false) {
      return false;
    }
  }

  return true;
}

module.exports = {
  fetch: function() {
    fetchMe(() => {
      loaded_ = {}
      const project_ids = process.env.PROJECT_IDS.split(',') || me_.projects.map((project) => {
        return project.project_id;
      });

      project_ids.forEach((project_id) => {
        loaded_[project_id] = {
          project: false,
          stories: false
        };
      });

      fetchProjects(project_ids);

      project_ids.forEach((project_id) => {
        fetchIterations(project_id);
      });
    });
  },

  loaded: loaded,

  get: function() {
    return {
      me: me_,
      projects: projects_,
      iterations: iterations_,
      current_iteration_stories: current_iteration_stories_,
      iteration_stories: iteration_stories_,
    }
  },
}
