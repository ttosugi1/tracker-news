'use strict';

const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');

const report = require('./report');
const features = require('./features');

function load_fixture() {
  return fs.readFileSync('fixtures/fixture.js', 'utf-8');
}

describe('report', function() {
  let target;

  beforeEach(function() {
    const raw = JSON.parse(load_fixture());
    const featuresJSON = features.generate(raw);
    target = report.generate(featuresJSON);
  });

  describe('collaborators', function() {
    it('reports number of collaborators over last 10 iterations', function() {
      expect(target).to.contain('You had 1 collaborator over the last 10 iterations');
    });
  });

  describe('story counts', function() {
    it('reports story requester rank', function() {
      expect(target).to.contain("Story Requester Stats");
      expect(target).to.contain("Miles Dyson (14)\nRobert Brewster (7)\nAndy Goode (5)\n\n");
    });
  });
});
