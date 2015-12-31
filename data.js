"use strict";

const request = require('request');
const helpers = require('./helpers');
const _ = require('lodash');

const HEADERS = {
  'X-TrackerToken': process.env.TRACKER_TOKEN
};

const BASE_URI = process.env.BASE_URI || 'https://www.pivotaltracker.com/services/v5'

let me_ = {};
let projects_ = {};
let stories_ = {};
let personMap_ = {};

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

function fetchStories(project_id, start_date, limit, offset) {
  return new Promise(function(resolve, reject) {
    const options = {
      url: `${BASE_URI}/projects/${project_id}/stories`,
      headers: HEADERS,
      qs: {
        updated_after: start_date,
        limit: limit,
        offset: offset,
      }
    }

    console.log(`fetchStories ${project_id}, ${start_date} ${offset}`);

    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const stories = JSON.parse(body);
        if (projects_[project_id].stories === undefined) {
          projects_[project_id].stories = [];
        }
        projects_[project_id].stories.push(stories);
        if (stories.length === limit) {
          fetchStories(project_id, start_date, limit, offset + limit)
        } else {
          resolve();
        }
      } else {
        reject();
      }
    });
  });
}

function fetchIterations(project_id) {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${BASE_URI}/projects/${project_id}/iterations`,
      qs: {
        offset: -12,
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
          projects_[project_id].iterations = reverseIterations;
          projects_[project_id].iteration_stories = [];

          reverseIterations.forEach((current_iteration) => {
            let stories = [];

            current_iteration.stories.forEach((story) => {
              stories.push(story);
            });

            projects_[project_id].iteration_stories.push(stories);
          });
          resolve();
        } else {
          reject('weird issue with api?');
        }
      } else {
        reject(response.statusCode);
      }
    });
  });
}

function fetchProjectMemberships(project_id) {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${BASE_URI}/projects/${project_id}/memberships`,
      headers: HEADERS
    }

    console.log(`fetchProjectMemberships ${project_id}`);

    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        const memberships = JSON.parse(body);
        projects_[project_id].memberships = memberships;

        memberships.forEach((membership) => {
          personMap_[membership.person.id] = membership.person;
        });

        resolve();
      } else {
        reject(`Could not fetch project memberships for project_id=${project_id} status code=${response.statusCode}`);
      }
    });
  });
}

module.exports = {
  fetch: function() {
    return new Promise((resolve, reject) => {
      let fetchMePromise = fetchMe();
      fetchMePromise.then((value) => {
        let projectIds;

        if (process.env.PROJECT_IDS) {
          projectIds = process.env.PROJECT_IDS.split(',');
        } else {
          projectIds = me_.projects.map(project => project.project_id);
        }

        const fetchProjectPromises = projectIds.map(project_id => fetchProject(project_id));

        const now = new Date();
        const yearAgo = now.setFullYear(now.getFullYear() - 1);

        Promise.all(fetchProjectPromises).then((value) => {
          const fetchStoryPromises = projectIds.map((projectId) => {
            return fetchStories(projectId, yearAgo, 500, 0);
          });

          const fetchIterationPromises = projectIds.map(project_id => fetchIterations(project_id));
          const fetchProjectMembershipPromises = projectIds.map(project_id => fetchProjectMemberships(project_id));

          const allPromises = [...fetchStoryPromises, ...fetchIterationPromises, ...fetchProjectMembershipPromises];

          Promise.all(allPromises).then((value) => {
            resolve('projects all loaded!');
          }).catch((reason) => {
            reject(`iteration or memberships not loaded! ${reason}`);
          });
        }).catch((reason) => {
          reject(`projects not loaded! ${reason}`);
        });
      }).catch((reason) => {
        reject(`projects not loaded! ${reason}`);
      });
    });
  },

  get: function() {
    return {
      me: me_,
      projects: projects_,
      personMap: personMap_,
    }
  },
}
