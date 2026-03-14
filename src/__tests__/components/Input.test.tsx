/**
 * Input 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '../../components/ui/Input'

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Username" />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
  })

  it('handles input changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('handles keyboard events', () => {
    const handleKeyDown = vi.fn()
    render(<Input onKeyDown={handleKeyDown} />)
    
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(handleKeyDown).toHaveBeenCalled()
  })

  it('applies disabled state', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('applies error state', () => {
    render(<Input error="Invalid input" />)
    expect(screen.getByText('Invalid input')).toBeInTheDocument()
  })
})
