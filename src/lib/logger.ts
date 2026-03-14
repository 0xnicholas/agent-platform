/**
 * Frontend Logger
 * 用于前端调试日志
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown[]
  timestamp: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 100
  private enabled = true

  private log(level: LogLevel, message: string, ...data: unknown[]) {
    if (!this.enabled) return

    const entry: LogEntry = {
      level,
      message,
      data: data.length > 0 ? data : undefined,
      timestamp: new Date().toISOString(),
    }

    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Console output with styling
    const styles = {
      debug: 'color: #9ca3af',
      info: 'color: #3b82f6',
      warn: 'color: #f59e0b',
      error: 'color: #ef4444',
    }

    console.log(`%c[${level.toUpperCase()}]`, styles[level], message, ...data)
  }

  debug(message: string, ...data: unknown[]) {
    this.log('debug', message, ...data)
  }

  info(message: string, ...data: unknown[]) {
    this.log('info', message, ...data)
  }

  warn(message: string, ...data: unknown[]) {
    this.log('warn', message, ...data)
  }

  error(message: string, ...data: unknown[]) {
    this.log('error', message, ...data)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clear() {
    this.logs = []
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  // 导出日志供调试
  export(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

export const logger = new Logger()

// 开发环境自动启用，生产环境禁用
if (import.meta.env.PROD) {
  logger.setEnabled(false)
}

export default logger
