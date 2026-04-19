import { Feature1Page } from '@features/feature1'

function App() {
    throw new Error('This is a test error for Sentry!')
    return (
        <div className="bg-amber-300">
            React Production Setup
            <Feature1Page />
        </div>
    )
}

export default App
