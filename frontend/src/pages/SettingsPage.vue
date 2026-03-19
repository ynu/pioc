<template>
  <div class="page settings-page">
    <h1>设置</h1>
    <div class="settings-section">
      <h2>用户设置</h2>
      <div class="form-group">
        <label>用户名</label>
        <input v-model="settings.username" type="text" />
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <input v-model="settings.email" type="email" />
      </div>
    </div>
    <div class="settings-section">
      <h2>系统设置</h2>
      <div class="form-group">
        <label>主题</label>
        <select v-model="settings.theme">
          <option value="dark">深色</option>
          <option value="light">浅色</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const settings = ref({
  username: '',
  email: '',
  theme: 'dark'
})
</script>

<style scoped>
.settings-page {
  padding: 2rem;
}
.settings-section {
  margin-top: 2rem;
}
.settings-section h2 {
  font-size: 1rem;
  margin-bottom: 1rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #a1a1aa;
}
.form-group input,
.form-group select {
  width: 100%;
  max-width: 300px;
  padding: 0.5rem;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 6px;
  color: #e4e4e7;
}
</style>