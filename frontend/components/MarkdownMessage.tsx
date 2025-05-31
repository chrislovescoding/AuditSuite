'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface MarkdownMessageProps {
  content: string
  className?: string
}

export default function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  // Handle empty content
  if (!content || content.trim() === '') {
    return <p className="text-sm text-gray-500 italic">No content</p>
  }

  const components: Components = {
    // Custom styling for code blocks
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const isInline = !match
      
      if (!isInline && match) {
        return (
          <SyntaxHighlighter
            style={tomorrow as any}
            language={match[1]}
            PreTag="div"
            className="rounded-md !mt-2 !mb-2 text-xs"
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        )
      }
      
      return (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" {...props}>
          {children}
        </code>
      )
    },
    // Custom styling for paragraphs
    p({ children }) {
      return <div className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</div>
    },
    // Custom styling for lists
    ul({ children }) {
      return <ul className="mb-2 pl-4 space-y-1 list-disc list-inside text-sm">{children}</ul>
    },
    ol({ children }) {
      return <ol className="mb-2 pl-4 space-y-1 list-decimal list-inside text-sm">{children}</ol>
    },
    li({ children }) {
      return <li className="text-sm leading-relaxed">{children}</li>
    },
    // Custom styling for headers
    h1({ children }) {
      return <h1 className="text-base font-bold mb-2 text-gray-900">{children}</h1>
    },
    h2({ children }) {
      return <h2 className="text-sm font-bold mb-2 text-gray-900">{children}</h2>
    },
    h3({ children }) {
      return <h3 className="text-sm font-semibold mb-1 text-gray-900">{children}</h3>
    },
    // Custom styling for blockquotes
    blockquote({ children }) {
      return (
        <blockquote className="border-l-3 border-blue-300 pl-3 py-1 my-2 bg-blue-50 italic text-sm">
          {children}
        </blockquote>
      )
    },
    // Custom styling for tables
    table({ children }) {
      return (
        <div className="overflow-x-auto my-2">
          <table className="min-w-full border border-gray-200 rounded-md text-xs">
            {children}
          </table>
        </div>
      )
    },
    th({ children }) {
      return (
        <th className="border border-gray-200 px-2 py-1 bg-gray-50 font-semibold text-left text-xs">
          {children}
        </th>
      )
    },
    td({ children }) {
      return (
        <td className="border border-gray-200 px-2 py-1 text-xs">
          {children}
        </td>
      )
    },
    // Custom styling for links
    a({ children, href }) {
      return (
        <a 
          href={href} 
          className="text-blue-600 hover:text-blue-800 underline text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      )
    },
    // Custom styling for strong/bold text
    strong({ children }) {
      return <strong className="font-semibold text-gray-900">{children}</strong>
    },
    // Custom styling for emphasis/italic text
    em({ children }) {
      return <em className="italic text-gray-700">{children}</em>
    },
    // Custom styling for horizontal rules
    hr() {
      return <hr className="my-3 border-gray-200" />
    }
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 