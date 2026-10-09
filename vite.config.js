import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/main.tsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    build: {
        // Keep mobile first-load small — admin/editor libs must not ship in the homepage chunk.
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return
                    if (id.includes('recharts') || id.includes('d3-')) return 'charts'
                    if (id.includes('quill') || id.includes('react-quill')) return 'editor'
                    if (id.includes('country-state-city')) return 'geo'
                    if (id.includes('sweetalert2')) return 'sweetalert'
                    if (id.includes('motion') || id.includes('framer-motion')) return 'motion'
                    if (id.includes('react-router')) return 'router'
                    if (
                        id.includes('node_modules/react-dom')
                        || id.includes('node_modules/react/')
                        || id.includes('node_modules\\react\\')
                        || id.includes('node_modules/scheduler')
                    ) {
                        return 'react-vendor'
                    }
                },
            },
        },
        chunkSizeWarningLimit: 900,
    },
    // Windows: Vite defaults to [::1], which breaks Laravel @vite / browsers on localhost
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        hmr: {
            host: '127.0.0.1',
        },
    },
})
