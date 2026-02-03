import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        plugins: [react(), tailwindcss()],
        base: '/',
        build: {
            outDir: 'build',
        },
        server: {
            port: 3350,
        },
    };
});
