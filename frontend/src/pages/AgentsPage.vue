<template>
  <div class="page agents-page">
    <div class="page-header">
      <h1>智能体</h1>
      <button class="btn-primary" @click="showCreateModal = true">+ 创建智能体</button>
    </div>
    <div class="agents-grid">
      <div v-for="agent in agents" :key="agent._id" class="agent-card">
        <div class="agent-avatar">{{ agent.name[0] }}</div>
        <div class="agent-info">
          <h3>{{ agent.name }}</h3>
          <p>{{ agent.description || '暂无描述' }}</p>
          <span class="agent-status" :class="agent.status">{{ agent.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showCreateModal = ref(false)
const agents = ref([])
</script>

<style scoped>
.agents-page {
  padding: 2rem;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.agent-card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
}
.agent-avatar {
  width: 48px;
  height: 48px;
  background: #27272a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
}
.agent-info h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}
.agent-info p {
  color: #71717a;
  font-size: 0.875rem;
  margin: 0 0 0.5rem;
}
.agent-status {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: #27272a;
  color: #a1a1aa;
}
.agent-status.active {
  background: #166534;
  color: #bbf7d0;
}
</style>