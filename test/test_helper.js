var childProcess = require('child_process');
var fse = require('fs-extra');
var Module = require('module');
var path = require('path');
var gitRepo = require('../lib/gitRepo');
var chai = require('chai');
var uuid = require('uuid');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

var SLASH_TEST_DIR_SLASH = '/test/';
var UNIT_DIR_SLASH = 'unit/';

function requireSourceModule(testModule, repoPath) {
  if(!testModule instanceof Module) {
    throw new Error('The test module muse be injected as the first parameter to `requireSourceModule`');
  }

  return module.parent.require(getSourcePath(testModule, repoPath));
}

function getSourcePath(testModule, repoPath) {
  if(!testModule instanceof Module) {
    throw new Error('The test module muse be injected as the first parameter to `getSourcePath`');
  }

  var modulePath = testModule.filename;
  var testRootIndex = modulePath.lastIndexOf(SLASH_TEST_DIR_SLASH);

  if (testRootIndex === -1) {
    throw new Error('getSourcePath must be called with a module in /test/, got ' + modulePath);
  }
  var repoRoot = modulePath.substring(0, testRootIndex) + '/';

  if (!repoPath) {
    repoPath = modulePath.substring(testRootIndex + SLASH_TEST_DIR_SLASH.length);
    if (repoPath.indexOf(UNIT_DIR_SLASH) === 0) {
      repoPath = repoPath.substring(UNIT_DIR_SLASH.length);
    }

    repoPath = repoPath.replace(/\.test\.js$/, '');
  }

  return require.resolve(path.join(repoRoot, repoPath));
}

function directory(name) {
  name = name || 'some-dir';
  var prefix = '/tmp' + path.sep;
  var dirPath = path.join('/tmp', 'affiance-' + uuid(), name);
  fse.ensureDirSync(dirPath);

  return dirPath;
}

function cleanupDirectory(path) {
  return fse.removeSync(path);
}

function tempRepo(options) {
  options = options || {};

  var repoPath = directory('some-repo');
  var execOptions = { cwd: repoPath };

  var initCommand = 'git init';
  if (options.templateDir) {
    initCommand += ' --template=' + options.templateDir;
  }

  childProcess.execSync(initCommand, execOptions);
  childProcess.execSync('git config --local user.name "Affiance Tester"', execOptions);
  childProcess.execSync('git config --local user.email "affiance@example.com"', execOptions);
  childProcess.execSync('git config --local rerere.enabled 0', execOptions);
  childProcess.execSync('git config --local commit.gpgsign false', execOptions);

  return repoPath;
}


// Add global beforeEach to clean up memoized values on utils.
// Ensures each test can setup repos and git directories without handling
// this cleanup.
beforeEach('clean up memoized utils', function() {
  gitRepo._repoRoot = null;
  gitRepo._gitDir = null;
});


module.exports = {
  chai: chai,
  cleanupDirectory: cleanupDirectory,
  directory: directory,
  expect: chai.expect,
  sinon: sinon,
  tempRepo: tempRepo,
  requireSourceModule: requireSourceModule,
  getSourcePath: getSourcePath
};

