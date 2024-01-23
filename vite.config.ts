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
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

import vitePluginImp from 'vite-plugin-imp'
import vueJsx from '@vitejs/plugin-vue-jsx'


const pathSrc = path.resolve(__dirname, 'src')

const mode =  _.last(process.argv) as string;
console.log("当前环境为:"+mode);

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      imports: ['vue','vue-router'],
      resolvers: [
        ElementPlusResolver({
          importStyle : "sass"
        }),
        // Auto import icon components
        IconsResolver(),
      ],
      dts: path.resolve(pathSrc, 'auto-imports.d.ts'),
      eslintrc: { enabled: true }
    }),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, "src/assets/icons")],
      symbolId: "icon-[dir]-[name]", // 注意这里的icon- 前缀我在svgIcon.vue中写死了的，如果调整了记得同步改一下
      // 有特殊需求可不进行该配置
      svgoOptions: {
        // 删除一些填充的属性
        plugins: [
          {
            name: "removeAttrs",
            params: { attrs: ["class", "data-name", "fill", "stroke"] },
          },
          // 删除样式标签
          "removeStyleElement",
        ],
      },
    }),
    Components({
      resolvers: [
        IconsResolver({
          enabledCollections: ['ep'],
        }),
        ElementPlusResolver({ importStyle : "sass"})
      ],
      dts: path.resolve(pathSrc, 'components.d.ts'),
    }),
    Icons({
      autoInstall: true,
    }),
    // vitePluginImp({
    //   libList: [
    //     {
    //       libName: '@formily/element-plus',
    //       libDirectory: 'esm',
    //       style(name) {
    //         return `@formily/element-plus/esm/${name}/style.js`
    //       },
    //     },
    //   ],
    // }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/element/index.scss" as *;`,
      },
    },
  },
  define :{
    'process.env' : process.env
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: loadEnv(mode,process.cwd()).VITE_GATEWAY_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
