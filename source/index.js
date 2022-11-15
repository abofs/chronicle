import { promises as fsp } from 'fs';
import { fileURLToPath } from 'url';
import projectPath from 'path';
import Color from './color.js';

const defaultOptions = {
  logToFileByDefault: false, // default setting (overridable by logToFile param)
  logTimestamp: false, // option to include timestamp in console logs
  path: 'logs/', // default log directory (relative to main project root directory)
  prefix: '',
  suffix: '',

  // log types with corresponding color settings
  additionalLogs: {},
  systemLogs: {
    info: 'cyan',
    warn: 'yellow',
    error: 'red',
  },
};

// used to sanitize defineType() options input
const optionKeys = Object.keys(defaultOptions);

export default class Chronicle {
  constructor(options = defaultOptions) {
    options = {
      ...defaultOptions,
      ...options,
    };
    this.options = options;
    this.options.path = this.sanitizePath(this.options.path);

    const { additionalLogs, systemLogs } = options;
    const logs = {
      ...systemLogs,
      ...additionalLogs,
    };

    this.color = new Color();
    this.typeOptions = [];

    // create direct convenience methods for logging
    for (const type of Object.keys(logs)) {
      this.defineType(type, logs[type]);
    }
  }

  // records setting and options for log type, and crates convenience method ie: chronicle.info()
  defineType(type, setting, options=null) {
    this.color.setLogColor(type, setting);

    // create convenience method if it doesn't exist
    if (!this[type]) this.createConvenienceMethod(type);

    if (!options) return;
    if (typeof options !== 'object') throw 'The options param must be an object.';

    for (let option of Object.keys(options)) {
      if (!optionKeys.includes(option)) {
        throw `${option} is not a valid configuration object.`
          + '\n For a list of available options, see https://github.com/abofs/chronicle#configuration';
      }

      // sanitize path input
      if (option === 'path') options[option] = this.sanitizePath(options[option]);
    }

    this.typeOptions[type] = options;
  }

  // proxy through `logAction` method in order to set defaults based on argument presence
  createConvenienceMethod(type) {
    this[type] = (content, logToFile, overwrite = false) =>
      this.logAction(type, content, logToFile, overwrite);
  }

  // validates params and sets configuration-based defaults for logging
  logAction(type, content, logToFile, overwrite) {
    // set logToFile default based on class options when not set
    if (arguments[2] === undefined) logToFile = this.getOptionForType(type, 'logToFileByDefault');

    // treat overwrite default as true for log type "debug"
    if (type === 'debug' && arguments[3] === undefined) overwrite = true;

    return this.log(content, type, logToFile, overwrite);
  }

  // retrieves option setting for given type, default to global
  getOptionForType(type, option) {
    const options = this.typeOptions[type];
    if (!options || !options[option]) return this.options[option];

    return options[option];
  }

  // exposes chalk for custom color options via defineType
  chalk() {
    return this.color.getChalkInstance();
  }

  // logs to console, and conditionally to file
  async log(content, type, logToFile, overwrite) {
    const logTimestamp = this.getOptionForType(type, 'logTimestamp');
    const timestamp = `[${new Date().toLocaleString('en-US')}]`;
    const chalkColorFunction = this.color.getLogColor(type);
    let prefix = this.getOptionForType(type, 'prefix');
    let suffix = this.getOptionForType(type, 'suffix');
    if (logTimestamp) prefix += `${timestamp} `;
    if (prefix) prefix = chalkColorFunction(prefix);
    if (suffix) suffix = chalkColorFunction(suffix);
    const coloredLog = chalkColorFunction(content);

    console.log(`${prefix}${coloredLog}${suffix}`); // eslint-disable-line no-console

    if (!logToFile) return;

    this.writeToFile(type, `${timestamp} ${content}\n`, overwrite);
  }

  // direct hardcoded debug method (log to file functionality is limited)
  async debug(content, logToFile = false, overwrite = true) {
    console.dir(content, { depth: 6 }); // eslint-disable-line no-console

    if (!logToFile) return;

    this.writeToFile('debug', JSON.stringify(content, null, 2), overwrite);
  }

  async writeToFile(type, content, overwrite) {
    const path = this.getOptionForType(type, 'path');
    const targetLog = `${path}${type}.log`;
    await this.validateFileAndDirectory(path, targetLog);

    const fileAction = overwrite ? fsp.writeFile : fsp.appendFile;

    return fileAction(targetLog, content);
  }

  // attempts to create file and/or directory if they don't already exist
  async validateFileAndDirectory(path, targetLog) {
    const errorMethod = this.error || console.error; // prefer native method unless removed by user

    /*
     * TODO: Fix known bug
     * Due to the asynchronous nature of these calls, when trying to run log write files at the same time,
     * we will encounter some issues, because fsp.access will fail while mkdir or writeFile is pending.
     * There are a few different ways to go about this, i think creating a queue system for matching path/targetLogs
     * can mitigate this edge case, while still allowing other future logs to write asynchronously.
     *
     * We do NOT want to fix this by removing the async feature.
     */
    const tempNotice = 'If directories are being created, you can ignore this error';

    await fsp.access(path).catch(() => {
      fsp.mkdir(path).catch(() => {
        errorMethod(`Failed to create configured directory: ${path} (${tempNotice})`);
      });
    });

    await fsp.access(targetLog).catch(() => {
      fsp.writeFile(targetLog, '').catch(() => {
        errorMethod(`Failed to create log file: ${targetLog} (${tempNotice})`);
      });
    });
  }

  // method to conditionally sanitize user configuration input
  sanitizePath(path) {
    const moduleDir = projectPath.dirname(fileURLToPath(import.meta.url));
    const delim = moduleDir.includes('node_modules') ? 'node_modules' : 'source';
    const splitDir = moduleDir.split(delim);

    if (splitDir.length < 2) throw ('Failed to locate your project\'s root directory.');

    // use project root directory behind path
    path = projectPath.resolve(splitDir[0], path);
    
    // force path property to contain a trailing "/"
    if (path[path.length - 1] !== '/') {
      path += '/';
    }

    return path;
  }
}
