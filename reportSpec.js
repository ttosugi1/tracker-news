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
    // it.only('works', function() {
    //   expect(target).to.contain('Your top collaborator is JOHN CC><CC АНД for the last 10 iterations with 1 story');
    // });
    it('reports number of collaborators over last 10 iterations', function() {
      expect(target).to.contain('You had 1 collaborator over the last 10 iterations');
    });
  });
});
