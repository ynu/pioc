<template>
  <div class="page home-page">
    <div class="hero">
      <h1>Personal Intelligence Operation Center</h1>
      <p>欢迎回来，指挥官</p>
    </div>
    <div class="quick-actions">
      <router-link to="/dashboard" class="action-card">
        <span class="icon">📊</span>
        <span>仪表盘</span>
      </router-link>
      <router-link to="/agents" class="action-card">
        <span class="icon">🤖</span>
        <span>智能体</span>
      </router-link>
      <router-link to="/tasks" class="action-card">
        <span class="icon">📋</span>
        <span>任务</span>
      </router-link>
      <router-link to="/memory" class="action-card">
        <span class="icon">🧠</span>
        <span>记忆</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home-page {
  padding: 2rem;
}
.hero {
  text-align: center;
  margin-bottom: 3rem;
}
.hero h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.hero p {
  color: #71717a;
}
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}
.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  text-decoration: none;
  color: #e4e4e7;
  transition: all 0.2s;
}
.action-card:hover {
  border-color: #3f3f46;
  background: #1f1f23;
}
.action-card .icon {
  font-size: 1.5rem;
}
</style>