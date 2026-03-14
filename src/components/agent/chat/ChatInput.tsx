/**
 * ChatInput 聊天输入框组件
 */

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Mic, Paperclip, StopCircle } from 'lucide-react'
import { Button } from '../../ui/Button'

interface ChatInputProps {
  onSend: (content: string) => void
  onStop?: () => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  onStop,
  isLoading = false,
  disabled = false,
  placeholder = '发送消息...',
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动调整高度
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }

  // 发送消息
  const handleSend = () => {
    if (!message.trim() || isLoading || disabled) return
    onSend(message.trim())
    setMessage('')
    
    // 重置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  // 键盘发送
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
          {/* 附件按钮 */}
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || isLoading}
            className="shrink-0"
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </Button>

          {/* 输入框 */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm max-h-[150px] py-2"
          />

          {/* 语音按钮 */}
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || isLoading}
            className="shrink-0"
          >
            <Mic className="w-5 h-5 text-gray-500" />
          </Button>

          {/* 发送/停止按钮 */}
          {isLoading ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStop}
              className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <StopCircle className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <p className="text-xs text-gray-400 mt-2 text-center">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  )
}
