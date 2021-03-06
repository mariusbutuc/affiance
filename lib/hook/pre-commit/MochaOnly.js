'use strict';
const PreCommitBase = require('./Base');

/**
 * @class MochaOnly
 * @extends PreCommitBase
 * @classdesc Check for '.only` usage in mocha test files
 */
module.exports = class MochaOnly extends PreCommitBase {
  /**
   * Use grep to check for `describe.only` or `it.only` in test files
   * Uses spawnPromiseOnApplicableFiles to parallelize
   *
   * @returns {Promise}
   * @resolves {string|string[]} 'pass' or a tuple of 'fail' and a message
   * @rejects {Error} An Error thrown or emitted while running the hook
   */
  run() {
    return new Promise((resolve, reject) => {
      this.spawnPromiseOnApplicableFiles().then((result) => {
        if (result.stdout.toString().trim()) {
          return resolve(['fail', 'A .only found in mocha test file:\n' + result.stdout.toString()]);
        } else {
          return resolve('pass');
        }
      }, reject);
    });
  }
};
