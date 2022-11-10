import { promises as fsp } from 'fs';
import Color from './color.js';

const defaultOptions = {
  logToFileByDefault: false, // default setting (overrideable by logToFile param)
  logTimestamp: false, // option to include timestamp in console logs
  path: 'logs/', // default log directory (from main project root)
  prefix: '',
  suffix: '',

  // log types with corresponding color settings
  additionalLogs: {},
  systemLogs: {
    info: '#007cae', // indigo blue
    warn: '#ae8f00', // bright orange
    error: 'red',
  },
};

export default class Chronicle {
  constructor(options = defaultOptions) {
    options = {...defaultOptions, ...options};
    this.options = options;

    const { additionalLogs, systemLogs } = options;
    const logs = {
      ...systemLogs,
      ...additionalLogs,
    };

    this.color = new Color();

    // create direct convenience methods for logging
    for (const type of Object.keys(logs)) {
      this.setColorForType(type, logs[type]);
    }
  }

  // records color setting for log type, and crates convenience method ie: chronicle.info()
  setColorForType(type, setting) {
    this.color.setLogColor(type, setting);

    // halt if convenience method already exists
    if (this[type]) return;

    this.createConvenienceMethod(type);
  }

  createConvenienceMethod(type) {
    this[type] = (content, logToFile, overwrite = false) => {
      // set logToFile default based on class options when not set
      if (!arguments[1]) logToFile = this.logToFileByDefault;

      // treat overwrite default as true for log type "debug"
      if (type === 'debug' && !arguments[3]) overwrite = true;

      return this.log(content, type, logToFile, overwrite);
    };
  }

  // exposes chalk for custom color options via setColorForType
  chalk() {
    return this.color.getChalkInstance();
  }

  // logs to console, and conditionally to file
  async log(content, type, logToFile, overwrite) {
    const { logTimestamp } = this.options;
    const timestamp = `[${new Date().toLocaleString('en-US')}]`;
    const chalkColorFunction = this.color.getLogColor(type);
    let { prefix, suffix } = this.options;
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
    console.dir(content, { depth: null }); // eslint-disable-line no-console

    if (!logToFile) return;

    this.writeToFile('debug', JSON.stringify(content, null, 2), overwrite);
  }

  // conditionally logs to file
  async writeToFile(type, content, overwrite) {
    const targetLog = `${this.options.path}${type}.log`;
    await this.validateFileAndDirectory(targetLog);

    const fileAction = overwrite ? fsp.writeFile : fsp.appendFile;

    return fileAction(targetLog, content);
  }

  // attempts to create file and/or directory if they don't already exist
  async validateFileAndDirectory(targetLog) {
    const { path } = this.options;

    await fsp.access(path).catch(() => {
      try {
        fsp.mkdir(path);
      } catch (e) {
        this.error('Failed to create configured directory for log files:', path);
        throw (e);
      }
    });

    await fsp.access(targetLog).catch(() => {
      try {
        fsp.writeFile(targetLog, '');
      } catch (e) {
        this.error('Failed to create log file:', targetLog);
        throw (e);
      }
    });
  }
}
