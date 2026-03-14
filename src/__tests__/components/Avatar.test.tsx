/**
 * Avatar 组件测试
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Avatar } from '../../components/ui/Avatar'

describe('Avatar', () => {
  it('renders without crashing', () => {
    const { container } = render(<Avatar>Test</Avatar>)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with src', () => {
    const { container } = render(<Avatar src="test.jpg" alt="test" />)
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'test.jpg')
  })
})
