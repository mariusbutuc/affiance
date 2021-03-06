'use strict';
const testHelper = require('../../test_helper');
const expect = testHelper.expect;
const utils = testHelper.requireSourceModule(module);

describe('utils', function() {
  describe('camelCase', function() {
    it('turns a dashed string into camel case', function() {
      expect(utils.camelCase('something-dashed')).to.equal('SomethingDashed');
    });

    it('turns a underscored string into camel case', function() {
      expect(utils.camelCase('something_underscored')).to.equal('SomethingUnderscored');
    });

    it('leaves already camel-cased strings as is', function() {
      expect(utils.camelCase('SomethingCamelCased')).to.equal('SomethingCamelCased');
    });
  });

  describe('mergeOptions', function() {
    beforeEach('setup defaults', function() {
      this.defaultOptions = {
        optionA: 'A',
        option1: 1,
        optionObj: {
          optionObjA: 'A',
          optionObjB: 'B'
        }
      };
    });

    it('uses all defaults if there are no defined options', function() {
      expect(utils.mergeOptions({}, this.defaultOptions)).to.deep.equal(this.defaultOptions);
    });

    it('keeps any options without defaults', function() {
      let newOptions = utils.mergeOptions({weird: 'option'}, this.defaultOptions);
      expect(newOptions).to.have.property('weird', 'option');

      for (let key in this.defaultOptions) {
        expect(newOptions[key]).to.deep.equal(this.defaultOptions[key]);
      }
    });

    it('keeps any options that override defaults', function() {
      let newOptions = utils.mergeOptions({option1: 2, optionObj: {optionObjA: 'C'}}, this.defaultOptions);

      expect(newOptions).to.have.property('optionA', 'A');
      expect(newOptions).to.have.property('option1', 2);
      expect(newOptions).to.have.property('optionObj').to.have.property('optionObjA', 'C');
      expect(newOptions).to.have.property('optionObj').to.have.property('optionObjB', 'B');
    });
  });

  describe('parentPid', function() {
    it('retrieves the parent pid', function() {
      // TODO figure out how to actually verify the parent pid.
      expect(utils.parentPid()).to.be.a('String');
      expect(utils.parentPid()).to.not.be.empty;
    });
  });

  describe('parentCommand', function() {
    it('retrieves the parent command name', function() {
      expect(utils.parentCommand()).to.match(/node/);
    });
  });

  describe('execSync', function() {
    it('executes the command and returns the output as a string', function() {
      let commandResult = utils.execSync('echo Hello World');
      expect(commandResult).to.be.a('String');
      expect(commandResult).to.equal('Hello World\n');
    });

    it('returns false if the command fails', function() {
      let commandResult = utils.execSync('someunknowncommandthatnooneshouldhaveinstalled');
      expect(commandResult).to.equal(false);
    });
  });

  describe('spawn', function() {
    it('executes the command in a non blocking way and returns the ChildProcess object', function(done) {
      let commandResult = utils.spawn('echo', ['Hello', 'World']);
      let output = '';
      commandResult.stdout.on('data', (data) => { output += data; });
      commandResult.on('close', (code, signal) => {
        expect(code).to.equal(0);
        expect(signal).to.not.exist;
        expect(output).to.equal('Hello World\n');
        done();
      });
      commandResult.on('error', done);
    });

    it('emits an error from the returned childProcess if the command fails', function(done) {
      let commandResult = utils.spawn('someunknowncommandthatnooneshouldhaveinstalled');
      commandResult.on('error',(err) => {
        expect(err).to.exist;
        done();
      });
    });
  });

  describe('spawnSync', function() {
    it('executes the command and returns the spawned object', function() {
      let commandResult = utils.spawnSync('echo', ['Hello', 'World']);
      expect(commandResult).to.be.a('Object');
      expect(commandResult.error).to.not.exist;
      expect(commandResult.status).to.equal(0);
      expect(commandResult.stdout.toString()).to.equal('Hello World\n');
      expect(commandResult.stderr.toString()).to.equal('');
    });

    it('executes the command and returns the spawned object with an error if the command does not exist', function() {
      let commandResult = utils.spawnSync('someunknowncommandthatnooneshouldhaveinstalled');
      expect(commandResult).to.be.a('Object');
      expect(commandResult.error).to.exist;
      expect(commandResult.error).to.have.property('code', 'ENOENT');
    });
  });
});
