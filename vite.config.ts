import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // base is '/score/' because the project is hosted on GitHub Pages under the /score path
  base: '/score/',
  plugins: [react()],
});
