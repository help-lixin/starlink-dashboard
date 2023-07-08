import path from 'path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig,loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import _ from 'lodash';

const pathSrc = path.resolve(__dirname, 'src')

const mode =  _.last(process.argv) as string;
console.log("当前环境为:"+mode);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue','vue-router'],
      resolvers: [
        ElementPlusResolver(),
        // Auto import icon components
        IconsResolver(),
      ],
      dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
      eslintrc: { enabled: true }
    }),
    Components({
      resolvers: [ 
        IconsResolver({
          enabledCollections: ['ep'],
        }),
        ElementPlusResolver() 
      ],
      dts: path.resolve(pathSrc, 'components.d.ts'),
    }),
    Icons({
      autoInstall: true,
    }),
  ],
  // define :{
  //   'process.env' : process.env
  // },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: loadEnv(mode,process.cwd()).VITE_GATEWAY_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
