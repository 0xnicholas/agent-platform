import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@stores': path.resolve(__dirname, './src/stores'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  build: {
    // 性能优化配置
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        // 代码分割优化
        manualChunks: {
          // React 生态
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 组件库
          'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 块大小警告阈值
    chunkSizeWarningLimit: 500,
  },
  // 依赖优化
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js', 'zustand'],
    exclude: [],
  },
  // 预构建配置
  esbuild: {
    // 移除控制台日志
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
