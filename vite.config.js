import react from '@vitejs/plugin-react';
import fs from 'fs/promises';
import { defineConfig } from 'vite';
import { svgrComponent } from 'vite-plugin-svgr-component';

export default defineConfig(() => ({
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    // loader: "tsx",
    // include: /src\/.*\.[tj]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      //     loader: {
      //       '.js': 'jsx',
      //       '.ts': 'tsx',
      //     },
      plugins: [
        {
          name: 'load-js-files-as-jsx',
          setup(build) {
            build.onLoad({ filter: /src\/.*\.js$/ }, async args => ({
              loader: 'jsx',
              contents: await fs.readFile(args.path, 'utf8')
            }));
          }
        }
      ]
    }
  },
  server: {
    port: 8080,
    base: '/ui/'
  },
  plugins: [
    svgrComponent(),
    react()
    //  viteTsconfigPaths(),
    // svgr({ exportType: 'named', jsxRuntime: 'automatic' })
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  resolve: {
    alias: [{ find: /^~/, replacement: '' }]
  },
  define: {
    'process.env': {}
    // global: {}
  },
  build: {
    outDir: 'dist'
  }
}));
