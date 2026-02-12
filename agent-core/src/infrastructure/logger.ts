export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;

  static setLevel(level: LogLevel) {
    this.level = level;
  }

  private static timestamp(): string {
    return new Date().toISOString();
  }

  static info(message: string, ...args: any[]) {
    if (this.level <= LogLevel.INFO) {
      console.log(`[${this.timestamp()}] [INFO] ${message}`, ...args);
    }
  }

  static warn(message: string, ...args: any[]) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[${this.timestamp()}] [WARN] ${message}`, ...args);
    }
  }

  static error(message: string, ...args: any[]) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[${this.timestamp()}] [ERROR] ${message}`, ...args);
    }
  }

  static debug(message: string, ...args: any[]) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[${this.timestamp()}] [DEBUG] ${message}`, ...args);
    }
  }
}
