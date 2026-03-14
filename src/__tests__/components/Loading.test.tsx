/**
 * Loading 组件测试
 */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Loading } from '../../components/ui/Loading'

describe('Loading', () => {
  it('renders without crashing', () => {
    const { container } = render(<Loading />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders spinner', () => {
    const { container } = render(<Loading />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
