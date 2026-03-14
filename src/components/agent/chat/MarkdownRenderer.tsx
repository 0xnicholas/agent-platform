/**
 * MarkdownRenderer Markdown 渲染组件
 */

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
  content: string
  isUser?: boolean
}

export function MarkdownRenderer({ content, isUser }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '')
          const code = String(children).replace(/\n$/, '')

          if (!inline && match) {
            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  margin: '0.5rem 0',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
                {...props}
              >
                {code}
              </SyntaxHighlighter>
            )
          }

          return (
            <code
              className={`px-1 py-0.5 rounded text-sm ${
                isUser ? 'bg-primary-700' : 'bg-gray-200'
              }`}
              {...props}
            >
              {children}
            </code>
          )
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        ul({ children }) {
          return <ul className="mb-2 pl-4 list-disc">{children}</ul>
        },
        ol({ children }) {
          return <ol className="mb-2 pl-4 list-decimal">{children}</ol>
        },
        li({ children }) {
          return <li className="mb-1">{children}</li>
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline ${
                isUser ? 'text-primary-200' : 'text-primary-600'
              }`}
            >
              {children}
            </a>
          )
        },
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>
        },
        em({ children }) {
          return <em className="italic">{children}</em>
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-gray-300 pl-3 italic my-2">
              {children}
            </blockquote>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
