import React from 'react'
import { render, screen } from '@testing-library/react'
import { IconTextList } from '.'

const props = {
  block: {
    title: '',
    titleColor: '',
    titleFont: 'roboto',
    background: '',
    items: [{
      text: '',
      textColor: 'rgb(230, 230, 230)',
      icon: '',
      iconColor: '#d6d6d6',
      font: 'roboto'
    }]
  },
  onUpdate: jest.fn(),
  addImage: jest.fn(),
  removeImage: jest.fn(),
  blockNames: [],
}

describe('Icon text', () => {
  it('sets color of next added item', async () => {
    const { rerender } = render(<IconTextList {...props} />)

    const addItem = screen.getByText("item +").parentElement
    expect(addItem).toHaveStyle('color: #e6e6e6')

    rerender(<IconTextList {...{
      ...props,
      block: {
        ...props.block,
        items: [
          props.block.items[0],
          {
            text: 'hello',
            textColor: '',
            icon: 'Exercise',
            iconColor: '',
            font: ''
          }
        ]
      }
    }} />)

    expect(screen.getAllByText('hello')[0]).toHaveStyle('color: #e6e6e6')
    expect(screen.getByText('exercise')).toHaveStyle('color: #d6d6d6')
  })
})

jest.mock('next/navigation', () => ({
  usePathname() {
    return '/my-page'
  },
}))

jest.mock('next-auth/react', () => ({
  useSession() {
    return { data: true }
  }
}))