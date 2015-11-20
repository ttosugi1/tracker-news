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
var iteration_stories_ = [];

function fetchMe() {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${BASE_URI}/me`,
      headers: HEADERS
    }

    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        me_ = JSON.parse(body);
        resolve();
      } else {
        reject();
      }
    });
  });
}

function fetchProject(project_id) {
  return new Promise(function(resolve, reject) {
    console.log(`fetchProject ${project_id}`);

    const options = {
      url: `${BASE_URI}/projects/${project_id}`,
      headers: HEADERS
    }

    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const project = JSON.parse(body);
        projects_[project_id] = project;
        resolve();
      } else {
        reject();
      }
    });
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
    }
  });
}

function fetchIterations(project_id) {
  return new Promise((resolve, reject) => {
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
          resolve();
        } else {
          console.log('weird issue with api?')
          reject();
        }
      } else {
        reject();
        console.log(response.statusCode)
      }
    });
  });
}

module.exports = {
  fetch: function() {
    return new Promise((resolve, reject) => {
      var fetchMePromise = fetchMe();
      fetchMePromise.then((value) => {
        userProjectIds = process.env.PROJECT_IDS.split(',');

        const project_ids = process.env.PROJECT_IDS.split(',') || me_.projects.map((project) => {
          return project.project_id;
        });

        const fetchProjectPromises = project_ids.map(project_id => fetchProject(project_id));
        const fetchIterationPromises = project_ids.map(project_id => fetchIterations(project_id));

        const allPromises = [...fetchProjectPromises, ...fetchIterationPromises];

        Promise.all(allPromises).then((value) => {
          resolve('projects all loaded!');
        }, (reason) => {
          reject('projects not loaded!');
        });

      }, (reason) => {
        reject('fetch me failed');
      });
    });
  },

  get: function() {
    return {
      me: me_,
      projects: projects_,
      iterations: iterations_,
      iteration_stories: iteration_stories_,
    }
  },
}
