import React from 'react'
import { screen, render } from '@testing-library/react'
import { BlockHeader } from '.'

describe('BlockHeader', () => {
  it('renders page links', () => {
    const links = [
      { label: 'About', index: 1 },
      { label: 'Contact', index: 2 },
    ]

    const block = {
      blockName: 'header',
      links,
      text: '',
      logo: '',
      color: '',
      font: 'roboto',
      background: ''
    }

    render(<BlockHeader {... {
      addImage: jest.fn(),
      removeImage: jest.fn(),
      onUpdate: jest.fn(),
      block,
      blockNames: ['image-text-left', 'two-icon-text']
    }} />)

    const expected = [
      { link: screen.getByText('About'), href: '#about' },
      { link: screen.getByText('Contact'), href: '#contact' },
    ]

    expected.forEach(({ link, href }) => expect(link).toHaveAttribute('href', href))
  })
})