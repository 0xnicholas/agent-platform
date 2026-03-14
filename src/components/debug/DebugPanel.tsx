/**
 * DebugPanel 调试面板
 * 按 Alt+D 打开/关闭
 */

import { useState, useEffect } from 'react'
import { logger, LogEntry } from '@lib/logger'
import { X, Trash2, Download, ChevronDown, ChevronUp } from 'lucide-react'

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isExpanded, setIsExpanded] = useState(true)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'd') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      setLogs(logger.getLogs())
    }, 500)

    return () => clearInterval(interval)
  }, [isOpen])

  if (!isOpen) return null

  const exportLogs = () => {
    const data = logger.export()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const levelColors: Record<string, string> = {
    debug: 'text-gray-400',
    info: 'text-blue-500',
    warn: 'text-yellow-500',
    error: 'text-red-500',
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[60vh] bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-gray-800 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Debug Panel</span>
          <span className="text-xs text-gray-400">({logs.length} logs)</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); logger.clear(); setLogs([]); }}
            className="p-1 hover:bg-gray-700 rounded"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); exportLogs(); }}
            className="p-1 hover:bg-gray-700 rounded"
            title="Export logs"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="max-h-80 overflow-y-auto text-xs font-mono">
          {logs.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              No logs yet. Press Alt+D to toggle.
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="px-3 py-1 border-b border-gray-800 hover:bg-gray-800">
                <span className="text-gray-500">
                  {log.timestamp.split('T')[1].slice(0, -1)}
                </span>
                {' '}
                <span className={levelColors[log.level]}>
                  [{log.level.toUpperCase()}]
                </span>
                {' '}
                <span>{log.message}</span>
                {log.data && (
                  <pre className="mt-1 text-gray-400 whitespace-pre-wrap">
                    {JSON.stringify(log.data, null, 0)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
