'use strict';

const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');

const features = require('./features');

const _ = require('underscore');

function load_fixture() {
  return fs.readFileSync('fixtures/fixture.js', 'utf-8');
}

describe('features', function() {
  let target;

  beforeEach(function() {
    const raw = JSON.parse(load_fixture());
    target = features.generate(raw);
  });

  it('works', function() {
    expect(target).to.not.equal(undefined);
  });

  it('contains multiple projects', function() {
    expect(_.size(target.projects)).to.equal(2);
  });

  describe('collaborator_counts', function() {
    it('counts last 3 iterations', function() {
      expect(_.size(target.projects[101].collaborator_counts)).to.equal(3);
    });
  });

  describe('aggregated_collaborator_counts', function() {
    it('totals all known iterations', function() {
      expect(_.size(target.projects[101].aggregated_collaborator_counts)).to.equal(1);
    });

    it('counts pairs with another person', function() {
      expect(target.projects[101].aggregated_collaborator_counts[211]).to.equal(1);
    });
  });

  describe('iteration_count', function() {
    it('works', function() {
      expect(target.projects[101].iteration_count).to.equal(10);
    });
  });

  describe('story_requested_counts', function() {
    it('counts number of stories requested', function() {
      expect(target.projects[101].story_requested_counts).to.eql(
        [
          {name: 'Miles Dyson', person_id: 201, count: 14},
          {name: 'Robert Brewster', person_id: 202, count: 7},
          {name: 'Andy Goode', person_id: 203, count: 5}
        ]
      );
    });

    it('calculates mean', function() {
      expect(target.projects[101].story_requested_stats.mean).to.equal(26/3);
    });

    it('calculates median', function() {
      expect(target.projects[101].story_requested_stats.median).to.equal(7);
    });
  });
});
