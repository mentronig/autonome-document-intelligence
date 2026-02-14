import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static level: LogLevel = LogLevel.INFO;
  private static logFilePath: string = path.resolve(process.cwd(), 'agent-core/logs/agent.log');

  static setLevel(level: LogLevel) {
    this.level = level;
  }

  private static timestamp(): string {
    return new Date().toISOString();
  }

  private static writeToFile(levelStr: string, message: string, ...args: unknown[]) {
    try {
      // Ensure directory exists (lazy check)
      const dir = path.dirname(this.logFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const logMessage = `[${this.timestamp()}] [${levelStr}] ${message} ${args.length ? JSON.stringify(args) : ''}\n`;
      fs.appendFileSync(this.logFilePath, logMessage);
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  private static safeConsole(method: 'log' | 'warn' | 'error' | 'debug', message: string, ...args: unknown[]) {
    try {
      console[method](`[${this.timestamp()}] [${method.toUpperCase()}] ${message}`, ...args);
    } catch (err: unknown) {
      const error = err as Error;
      // Ignore EPIPE (Broken Pipe) errors, commonly happens in Windows terminals or when piping
      if ((error as any).code !== 'EPIPE') {
        // If it's not EPIPE, try to write to stderr purely as a fallback, or just ignore to prevent crash loop
        try {
          process.stderr.write(`Logger Console Error: ${error.message}\n`);
        } catch (_) { /* giving up */ }
      }
    }
  }

  static info(message: string, ...args: unknown[]) {
    if (this.level <= LogLevel.INFO) {
      this.safeConsole('log', message, ...args);
      this.writeToFile('INFO', message, ...args);
    }
  }

  static warn(message: string, ...args: unknown[]) {
    if (this.level <= LogLevel.WARN) {
      this.safeConsole('warn', message, ...args);
      this.writeToFile('WARN', message, ...args);
    }
  }

  static error(message: string, ...args: unknown[]) {
    if (this.level <= LogLevel.ERROR) {
      this.safeConsole('error', message, ...args);
      this.writeToFile('ERROR', message, ...args);
    }
  }

  static debug(message: string, ...args: unknown[]) {
    if (this.level <= LogLevel.DEBUG) {
      this.safeConsole('debug', message, ...args);
      this.writeToFile('DEBUG', message, ...args);
    }
  }
}
