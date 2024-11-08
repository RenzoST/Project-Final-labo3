import { defineConfig } from 'vite';
import staticCopy from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    staticCopy({
      targets: [
        { src: 'src/views/*', dest: 'views' }, // Copia todas tus vistas a dist/views
      ],
    }),
  ],
});
