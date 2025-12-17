import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    const alias = isDev
        ? {
            'rssa-study-template': path.resolve(
                process.cwd(),
                '../../libraries/rssa-study-template/src/index.ts'
            ),
        }
        : undefined;

    return {
        plugins: [react(), tailwindcss()],
        base: '/preference-visualization/',
        resolve: {
            alias,
        },
        build: {
            outDir: 'build',
        },
        server: {
            port: 3350,
        },
    };
});
