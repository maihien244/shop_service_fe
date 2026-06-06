import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

function esToolkitCompatPlugin() {
  return {
    name: 'es-toolkit-compat-resolver',
    enforce: 'pre' as const,
    resolveId(source: string, importer?: string) {
      if (source.startsWith('es-toolkit/compat/')) {
        const funcName = source.replace('es-toolkit/compat/', '');
        return `virtual:es-toolkit-compat/${funcName}?importer=${encodeURIComponent(importer || '')}`;
      }
      return null;
    },
    async load(id: string) {
      if (id.startsWith('virtual:es-toolkit-compat/')) {
        const url = new URL(id, 'file://');
        const funcName = url.pathname.split('/').pop();
        const importer = url.searchParams.get('importer');
        
        console.log(`[Plugin debug] Loading virtual ID: ${id}`);
        console.log(`[Plugin debug] Importer context: ${importer}`);
        
        const resolved = await this.resolve('es-toolkit/compat', importer || undefined, { skipSelf: true });
        console.log(`[Plugin debug] Resolved path:`, resolved ? resolved.id : 'null');
        
        if (resolved) {
          return `import { ${funcName} } from '${resolved.id}'; export default ${funcName};`;
        }
      }
      return null;
    }
  };
}

const config = defineConfig({
  resolve: { 
    tsconfigPaths: true,
    alias: {
      '@': resolve(__dirname, './src'),
    },
   },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    viteReact(),
    esToolkitCompatPlugin(),
  ],
  optimizeDeps: {
    exclude: ['es-toolkit']
  },
  server: {
    allowedHosts: ['2b1e-2405-4802-1d45-9060-34a0-99cd-7171-78b1.ngrok-free.app', 'localhost']
  }
})
export default config

