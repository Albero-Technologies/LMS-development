import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['test/**/*.test.ts'],
        setupFiles: ['test/setup.ts'],
        testTimeout: 20_000,
        hookTimeout: 20_000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov', 'html'],
            reportsDirectory: 'coverage',
            exclude: ['dist/**', 'prisma/**', 'test/**', '**/*.d.ts', 'src/docs/**', 'src/worker.ts', 'src/server.ts']
        }
    }
})
