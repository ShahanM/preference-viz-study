import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    base: '/preference-visualization/',
    build: {
        outDir: 'build',
    },
    server: {
        port: 3330,
    },
});
