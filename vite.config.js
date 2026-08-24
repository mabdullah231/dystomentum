import { defineConfig } from 'vite';
import path from 'node:path';
import electron from 'vite-plugin-electron/simple';
import react from '@vitejs/plugin-react';
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    plugins: [
        react(),
        electron({
            main: {
                entry: 'electron/main.ts',
                vite: {
                    build: {
                        rollupOptions: {
                            external: ['better-sqlite3', 'sql.js'],
                        },
                    },
                },
            },
            preload: {
                input: path.join(__dirname, 'electron/preload.ts'),
            },
        }),
    ],
    optimizeDeps: {
        exclude: ['better-sqlite3'],
    },
});
