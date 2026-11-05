import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  SureMarkdownText,
  parseSureMarkdownBlocks,
  renderSureInlineMarkdown,
} from './sure-markdown'

describe('parseSureMarkdownBlocks', () => {
  it('splits paragraphs and bullet lists', () => {
    const blocks = parseSureMarkdownBlocks(
      'Intro line\n\n- **Vehicle:** Mira\n- **Registration:** KDY184S\n\nNext question'
    )

    expect(blocks).toEqual([
      { type: 'paragraph', lines: ['Intro line'] },
      {
        type: 'ul',
        items: ['**Vehicle:** Mira', '**Registration:** KDY184S'],
      },
      { type: 'paragraph', lines: ['Next question'] },
    ])
  })

  it('parses numbered lists', () => {
    const blocks = parseSureMarkdownBlocks(
      '1. **Cover Type:** Comprehensive\n2. **Usage:** private'
    )

    expect(blocks).toEqual([
      {
        type: 'ol',
        items: ['**Cover Type:** Comprehensive', '**Usage:** private'],
      },
    ])
  })
})

describe('renderSureInlineMarkdown', () => {
  it('turns **bold** into strong without leaving asterisks', () => {
    const { container } = render(<>{renderSureInlineMarkdown('**Vehicle:** Mira')}</>)
    const strong = container.querySelector('strong')
    expect(strong).not.toBeNull()
    expect(strong?.textContent).toBe('Vehicle:')
    expect(container.textContent).toBe('Vehicle: Mira')
    expect(container.textContent).not.toContain('**')
  })

  it('turns *italic* into em', () => {
    const { container } = render(
      <>{renderSureInlineMarkdown('Do you want *Comprehensive* or *Third Party*?')}</>
    )
    const ems = container.querySelectorAll('em')
    expect(ems).toHaveLength(2)
    expect(ems[0]?.textContent).toBe('Comprehensive')
    expect(ems[1]?.textContent).toBe('Third Party')
    expect(container.textContent).not.toContain('*')
  })
})

describe('SureMarkdownText', () => {
  it('renders bold labels and list items neatly', () => {
    render(
      <SureMarkdownText
        text={
          'I found the vehicle:\n- **Vehicle:** 2019 Daihatsu Mira\n- **Registration:** KDY184S\n\n1. **Cover Type:** Do you want *Comprehensive*?'
        }
      />
    )

    expect(screen.getByText('Vehicle:')).toBeInTheDocument()
    expect(screen.getByText('Registration:')).toBeInTheDocument()
    expect(screen.getByText('Cover Type:')).toBeInTheDocument()
    expect(screen.getByText('Comprehensive')).toBeInTheDocument()
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument()
  })

  it('does not execute HTML from the model as markup', () => {
    const { container } = render(
      <SureMarkdownText text={'Hello <script>alert(1)</script> world'} />
    )

    expect(container.querySelector('script')).toBeNull()
    expect(container.textContent).toContain('<script>alert(1)</script>')
  })
})
