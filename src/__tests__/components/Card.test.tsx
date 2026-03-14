/**
 * Card 组件测试
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'

describe('Card', () => {
  it('renders Card component', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders Card with className', () => {
    render(<Card className="custom-class">Card content</Card>)
    const card = screen.getByText('Card content')
    expect(card).toHaveClass('custom-class')
  })

  it('renders CardHeader', () => {
    render(
      <Card>
        <CardHeader>
          <h2>Header Title</h2>
        </CardHeader>
      </Card>
    )
    expect(screen.getByText('Header Title')).toBeInTheDocument()
  })

  it('renders CardContent', () => {
    render(
      <Card>
        <CardContent>Content goes here</CardContent>
      </Card>
    )
    expect(screen.getByText('Content goes here')).toBeInTheDocument()
  })

  it('renders CardHeader with custom className', () => {
    render(
      <Card>
        <CardHeader className="header-class">
          <h2>Header</h2>
        </CardHeader>
      </Card>
    )
    const header = screen.getByText('Header')
    expect(header.parentElement).toHaveClass('header-class')
  })
})
