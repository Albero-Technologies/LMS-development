import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Feature1Page from './Feature1Page'

describe('Feature1Page', () => {
    it('render page', () => {
        render(<Feature1Page />)
        expect(screen.getAllByText('Feature1 Page')).toHaveLength(1)
    })
})
