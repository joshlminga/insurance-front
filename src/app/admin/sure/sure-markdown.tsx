import { Fragment, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SureMarkdownTextProps = {
  text: string
  className?: string
}

type Block =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }

/** Split assistant reply into paragraphs + list blocks (simple markdown subset). */
export function parseSureMarkdownBlocks(text: string): Block[] {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) {
    return []
  }

  const blocks: Block[] = []
  const chunks = normalized.split(/\n{2,}/)

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((line) => line.trimEnd())
    if (lines.length === 0) {
      continue
    }

    if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) {
      blocks.push({
        type: 'ul',
        items: lines.map((line) => line.trim().replace(/^[-*]\s+/, '')),
      })
      continue
    }

    if (lines.every((line) => /^\d+\.\s+/.test(line.trim()))) {
      blocks.push({
        type: 'ol',
        items: lines.map((line) => line.trim().replace(/^\d+\.\s+/, '')),
      })
      continue
    }

    // Mixed: peel leading/trailing list runs, keep middle as paragraph lines
    const paragraphLines: string[] = []
    let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null

    const flushList = () => {
      if (listBuffer && listBuffer.items.length > 0) {
        blocks.push(listBuffer)
      }
      listBuffer = null
    }

    const flushParagraph = () => {
      if (paragraphLines.length > 0) {
        blocks.push({ type: 'paragraph', lines: [...paragraphLines] })
        paragraphLines.length = 0
      }
    }

    for (const line of lines) {
      const trimmed = line.trim()
      if (/^[-*]\s+/.test(trimmed)) {
        flushParagraph()
        if (!listBuffer || listBuffer.type !== 'ul') {
          flushList()
          listBuffer = { type: 'ul', items: [] }
        }
        listBuffer.items.push(trimmed.replace(/^[-*]\s+/, ''))
        continue
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        flushParagraph()
        if (!listBuffer || listBuffer.type !== 'ol') {
          flushList()
          listBuffer = { type: 'ol', items: [] }
        }
        listBuffer.items.push(trimmed.replace(/^\d+\.\s+/, ''))
        continue
      }
      flushList()
      paragraphLines.push(line)
    }

    flushList()
    flushParagraph()
  }

  return blocks
}

/**
 * Inline markdown → React nodes (no HTML injection).
 * Order: **bold** first, then *italic* / _italic_.
 */
export function renderSureInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  // Bold **...**, italic *...* or _..._ (non-greedy, no nesting across newlines)
  const pattern = /(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|_[^_\n]+?_)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={`t-${key++}`}>
          {text.slice(lastIndex, match.index)}
        </Fragment>
      )
    }

    const token = match[0]
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`b-${key++}`} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      nodes.push(
        <em key={`i-${key++}`} className="italic">
          {token.slice(1, -1)}
        </em>
      )
    } else {
      nodes.push(<Fragment key={`r-${key++}`}>{token}</Fragment>)
    }

    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(
      <Fragment key={`t-${key++}`}>{text.slice(lastIndex)}</Fragment>
    )
  }

  return nodes
}

/** Renders Gemini-style chat markdown as neat React nodes (no dangerouslySetInnerHTML). */
export function SureMarkdownText({ text, className }: SureMarkdownTextProps) {
  const blocks = parseSureMarkdownBlocks(text)

  if (blocks.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-3 text-sm leading-relaxed text-foreground', className)}>
      {blocks.map((block, blockIndex) => {
        if (block.type === 'ul') {
          return (
            <ul
              key={`ul-${blockIndex}`}
              className="list-disc space-y-1 pl-5"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`uli-${blockIndex}-${itemIndex}`}>
                  {renderSureInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          )
        }

        if (block.type === 'ol') {
          return (
            <ol
              key={`ol-${blockIndex}`}
              className="list-decimal space-y-1 pl-5"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`oli-${blockIndex}-${itemIndex}`}>
                  {renderSureInlineMarkdown(item)}
                </li>
              ))}
            </ol>
          )
        }

        return (
          <p key={`p-${blockIndex}`} className="whitespace-pre-wrap">
            {block.lines.map((line, lineIndex) => (
              <Fragment key={`pl-${blockIndex}-${lineIndex}`}>
                {lineIndex > 0 ? <br /> : null}
                {renderSureInlineMarkdown(line)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
