/*
 * Chronicle usage samples
 */

import Chronicle from './index.js';

/*
 * Default settings (Out of the box)
 */
function defaultSample() {
  // instantiate chronicle with default settings
  const chronicle = new Chronicle();

  chronicle.info('Info: sample application has started');
  chronicle.warn('Warning: this is just a sample');
  chronicle.error('Error: no application logic detected', true); // passes true in order to log to logs/error.log file
  chronicle.debug(chronicle.color.types, true);
}

/*
 * Fully custom system logging configuration
 */
function customSystemLogsSample() {
  // instantiate chronicle with custom system logs
  const chronicle = new Chronicle({
    systemLogs: {
      blue: '#007cae',
      yellow: '#ae8f00', // bright orange
      red: 'red',
    },
  });

  chronicle.blue('Info: using custom method blue, sample application has started');
  chronicle.yellow('Warning: using custom method yellow, this is just a sample');
  chronicle.red('Error: using custom method red, no application logic detected', false);
}

/*
 * Fully custom system logging configuration
 */
function customOptionsSample() {
  // instantiate chronicle with custom options
  const chronicle = new Chronicle({
    logToFileByDefault: true,
    logTimestamp: true,
    path: 'custom-logs', // purposely didn't include trailing "/" to test input sanitizer
    prefix: '--------------------------------------------------------------- \n',
    suffix: '\n=============================================================== \n',
  });

  chronicle.info('Info: sample application has started');
  chronicle.warn('Warning: this is just a sample');
  chronicle.error('Error: no application logic detected');
}

/*
 * Fully custom system logging configuration
 */
function additionalLogsSample() {
  // instantiate chronicle with additional logs, and advanced color setting
  const chronicle = new Chronicle({ additionalLogs: { question: 'green' }});

  // create additional log with advanced direct chalk configuration
  chronicle.setColorForType('query', chronicle.chalk().black.bgGreen);

  chronicle.question('What will a fully custom chalk color function look like?');
  chronicle.query('This is what a custom chalk color setting looks like');
}

defaultSample();
customSystemLogsSample();
customOptionsSample();
additionalLogsSample();
