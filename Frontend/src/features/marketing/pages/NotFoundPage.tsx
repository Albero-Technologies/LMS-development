import { Link } from 'react-router-dom'
import { Button } from '@shared/components/ui/Button'

export const NotFoundPage = () => (
    <div className="min-h-screen bg-aurora-soft flex items-center justify-center p-6">
        <div className="text-center">
            <div className="font-mono text-xs tracking-[0.22em] text-ink-500 uppercase">404 · route not found</div>
            <h1 className="mt-4 font-display text-6xl text-ink-50 tracking-tight">
                This page <em className="italic text-aurora">doesn't exist</em>.
            </h1>
            <p className="mt-4 text-ink-400 max-w-md mx-auto">
                Maybe it was moved, maybe it never existed. Either way, let's get you back to something useful.
            </p>
            <div className="mt-6">
                <Link to="/">
                    <Button>Back to home</Button>
                </Link>
            </div>
        </div>
    </div>
)
