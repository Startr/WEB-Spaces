import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { execSync } from 'child_process'
import path from 'path'

export default defineConfig({
  base: '',
  plugins: [
    {
      name: 'salt-rooms',
      buildStart() {
        execSync('python3 salt_rooms.py', {
          stdio: 'inherit',
          cwd: path.resolve(__dirname, 'src')
        })
      }
    },
    vue()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
