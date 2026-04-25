import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect } from 'vitest'
import { LandingPage } from './LandingPage'

describe('LandingPage', () => {
    it('renders the hero and CTA', () => {
        const qc = new QueryClient()
        render(
            <QueryClientProvider client={qc}>
                <MemoryRouter>
                    <LandingPage />
                </MemoryRouter>
            </QueryClientProvider>
        )
        expect(screen.getByText(/Master new skills/i)).toBeInTheDocument()
        expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
    })
})
