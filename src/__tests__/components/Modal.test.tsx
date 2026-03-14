/**
 * Modal 组件测试
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../../components/ui/Modal'

describe('Modal', () => {
  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('renders footer buttons', () => {
    render(
      <Modal
        isOpen={true}
        title="Test Modal"
        footer={
          <>
            <button>Cancel</button>
            <button>Confirm</button>
          </>
        }
      >
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} title="Test Modal" onClose={handleClose}>
        <p>Modal content</p>
      </Modal>
    )
    
    // Find and click the close button (X icon)
    const closeButtons = document.querySelectorAll('button')
    fireEvent.click(closeButtons[0])
    expect(handleClose).toHaveBeenCalled()
  })

  it('calls onClose when escape key is pressed', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} title="Test Modal" onClose={handleClose}>
        <p>Modal content</p>
      </Modal>
    )
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalled()
  })
})
