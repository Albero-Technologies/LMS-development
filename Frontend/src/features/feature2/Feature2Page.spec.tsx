import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Feature2Page from './Feature2Page'

describe('Feature2Page', () => {
    it('render page', () => {
        render(<Feature2Page />)
        expect(screen.getAllByText('Feature2 Page')).toHaveLength(1)
    })
})
