<template>
  <div class="page login-page">
    <div class="login-card">
      <h1>登录 PIOC</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="form.username" type="text" required />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" required />
        </div>
        <button type="submit" class="btn-primary">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({
  username: '',
  password: ''
})

const handleLogin = () => {
  // TODO: Implement login
  router.push('/dashboard')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
}
.login-card h1 {
  text-align: center;
  margin-bottom: 2rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #a1a1aa;
}
.form-group input {
  width: 100%;
  padding: 0.75rem;
  background: #0a0a0f;
  border: 1px solid #27272a;
  border-radius: 6px;
  color: #e4e4e7;
}
.btn-primary {
  width: 100%;
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}
.btn-primary:hover {
  background: #2563eb;
}
</style>