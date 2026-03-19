<template>
  <div class="page dashboard-page">
    <h1>仪表盘</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ stats.agents }}</span>
        <span class="stat-label">智能体</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.tasks }}</span>
        <span class="stat-label">任务</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.running }}</span>
        <span class="stat-label">运行中</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.memory }}</span>
        <span class="stat-label">记忆条目</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const stats = ref({
  agents: 0,
  tasks: 0,
  running: 0,
  memory: 0
})
</script>

<style scoped>
.dashboard-page {
  padding: 2rem;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}
.stat-card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}
.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 600;
  color: #a1a1aa;
}
.stat-label {
  color: #71717a;
  font-size: 0.875rem;
}
</style>