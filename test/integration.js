import Qunit from 'qunit';
import { promises as fsp } from 'fs';
import Chronicle from '../source/index.js';

const { module, test } = Qunit;

function removeDirectory(path, assert) {
  return fsp.rm(path, {recursive: true, force: true}).catch(() => {
    assert.throws(() => {
      throw new Error('Failed to remove log directory');
    });
  });
}

async function targetExists(target) {
  let targetExists;
  await fsp.access(target).then(() => targetExists = true).catch(() => targetExists = false);

  return targetExists;
}

/*
 * NOTE: util function to allow time for files to be created. May be worth making log functions return a
 * promise that resolves only after log file operations have completed. This would remove the need to use
 * this timeout function in our tests, speeding up our tests and making them less flaky.
 */
function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module('[Integration] Chronicle Tests', function() {
  test('Convenience methods for systemlogs are successfuly created', function(assert) {
    const chronicle = new Chronicle({ systemLogs: { a: 'white', b: 'blue', c: 'red' }});
    const { a, b, c, info, warn, error } = chronicle;

    assert.deepEqual(
      [typeof a, typeof b, typeof c, info, warn, error],
      ['function', 'function', 'function', undefined, undefined, undefined],
      'systemLogs funtions were replaced by configuration'
    );
  });

  test('Convenience methods for additionalLogs are successfuly created', function(assert) {
    const chronicle = new Chronicle({ additionalLogs: { a: 'white', b: 'blue', error: 'red' } });
    const { a, b, info, warn, error } = chronicle;

    assert.deepEqual(
      [typeof a, typeof b, typeof info, typeof warn, typeof error],
      ['function', 'function', 'function', 'function', 'function'],
      'additionalLogs functions were merged with systemLogs'
    );
  });

  test('Debug method is successfully created', function(assert) {
    const chronicle = new Chronicle();

    assert.equal(typeof chronicle.debug, 'function', 'debug method exists');
  });

  test('Log creation respects the default logToFileByDefault as false', async function(assert) {
    const chronicle = new Chronicle({ systemLogs: { test: 'green' } });
    const { path } = chronicle.options;

    let logDirExists = await targetExists(path);
    
    // clean up log directory before test if it exists
    if (logDirExists) {
      await removeDirectory(path, assert);
    }

    chronicle.test('log test');
    await timeout(500); // allow file and directory .5 seconds to be created.
    logDirExists = await targetExists(path);

    assert.notOk(logDirExists, 'Log directory does not exist');

    chronicle.test('log to file test', true);
    await timeout(500); // allow file and directory .5 seconds to be created.
    logDirExists = await targetExists(path);
    const logFileExists = await targetExists(`${path}test.log`);

    assert.ok(logDirExists, 'log directory exists');
    assert.ok(logFileExists, 'log file exists');

    // clean up to prevent test polution
    await removeDirectory(path, assert);
  });

  test('Log creation respects the configured logToFileByDefault setting as true', async function(assert) {
    const chronicle = new Chronicle({ logToFileByDefault: true, systemLogs: { test: 'green' } });
    const { path } = chronicle.options;

    let logDirExists = await targetExists(path);
    
    // clean up log directory before test if it exists
    if (logDirExists) {
      await removeDirectory(path, assert);
    }

    chronicle.test('log to file test');
    await timeout(500); // allow file and directory .5 seconds to be created.
    logDirExists = await targetExists(path);
    const logFileExists = await targetExists(`${path}test.log`);

    assert.ok(logDirExists, 'log directory exists');
    assert.ok(logFileExists, 'log file exists');

    await removeDirectory(path, assert); // cleanup directory

    chronicle.test('log to file test', false);
    await timeout(1500); // allow file and directory up to .5 seconds to be created.
    logDirExists = await targetExists(path);

    assert.notOk(logDirExists, 'log directory does not exists');
  });

  test('Log creation respects the configured path setting', async function(assert) {
    const chronicle = new Chronicle({ path: 'test-logs', systemLogs: { test: 'green' } });
    const { path } = chronicle.options;

    assert.ok(path.includes('test-logs', 'configured directory is correct'));

    chronicle.test('log to file test', true);
    await timeout(1500); // allow file and directory up to .5 seconds to be created.
    const logDirExists = await targetExists(path);
    const logFileExists = await targetExists(`${path}test.log`);

    assert.ok(logDirExists, 'log directory exists');
    assert.ok(logFileExists, 'log file exists');

    await removeDirectory(path, assert); // cleanup directory
  });
});