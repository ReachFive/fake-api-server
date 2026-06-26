/// <reference types="node" />
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    base: '/ui/',
    plugins: [
        tanstackRouter({ routesDirectory: './src/routes' }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        outDir: 'dist',
    },
    server: {
        proxy: {
            '/version': 'http://localhost:1090',
            '/mock': 'http://localhost:1090',
            '/twilio': 'http://localhost:1090',
        },
    },
})
