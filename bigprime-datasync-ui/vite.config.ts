import {fileURLToPath, URL} from 'node:url'
import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'
import autoImportPlugin from '@opentiny/unplugin-tiny-vue'
import ViteCompression from 'vite-plugin-compression'
import {resolve} from 'path'

export default defineConfig(({mode, command}) => {
    const isBuild = command === 'build'
    const env = loadEnv(mode, process.cwd())
    return {
        base: '/',
        plugins: [
            vue(),
            autoImportPlugin('vite'),
            vueJsx(),
            VueDevTools(),
            ViteCompression({
                disable: !isBuild,
                threshold: 10240,
                algorithm: 'gzip',
                ext: '.gz'
            })
        ],
        define: {
            'process.env': {...process.env},
            'global': 'globalThis'
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        server: {
            port: 7002, // 端口号
            open: true, // 是否自动打开浏览器
            proxy: {
                '/api/': {
                    target: env.VITE_API_URL, //目标地址,一般是服务器地址
                    changeOrigin: true, //允许跨域
                    ws: true, //允许websocket代理
                    //rewrite: path => path.replace(/^\/api\//, '') //重写路径
                },
                '/ws': {
                    target: env.VITE_API_URL, //WebSocket目标地址
                    changeOrigin: true,
                    ws: true, //启用websocket代理
                },
                '/lsp': {
                    target: env.VITE_API_URL, //Python LSP WebSocket（避开SockJS /ws 拦截）
                    changeOrigin: true,
                    ws: true,
                }
            }
        },
        css: {
            preprocessorOptions: {
                less: {
                    modifyVars: {
                        hack: `true; @import (reference) "${resolve(
                            'src/assets/style/breakpoint.less'
                        )}";`
                    },
                    javascriptEnabled: true
                }
            }
        },
        optimizeDeps: {
            include: [
                `monaco-editor/esm/vs/language/json/json.worker`,
                `monaco-editor/esm/vs/language/css/css.worker`,
                `monaco-editor/esm/vs/language/html/html.worker`,
                `monaco-editor/esm/vs/language/typescript/ts.worker`,
                `monaco-editor/esm/vs/editor/editor.worker`
            ],
        },
        build: {
            outDir: '../bigprime-datasync-backend/src/main/resources/static',
            emptyOutDir: true,
            rollupOptions: {
                output: {
                    manualChunks: {
                        'vue-vendor': ['vue', 'vue-router', 'pinia'],
                        'opentiny': ['@opentiny/vue'],
                        'tiny-robot': ['@opentiny/tiny-robot', '@opentiny/tiny-robot-kit', '@opentiny/tiny-robot-svgs'],
                        'genui-sdk': ['@opentiny/genui-sdk-vue']
                    }
                }
            }
        }
    }
})

