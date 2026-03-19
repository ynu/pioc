<template>
  <div class="page memory-page">
    <h1>记忆库</h1>
    <div class="memory-list">
      <div v-for="item in memories" :key="item._id" class="memory-item">
        <div class="memory-content">{{ item.content }}</div>
        <div class="memory-meta">{{ item.type }} · {{ formatDate(item.createdAt) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const memories = ref([])

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.memory-page {
  padding: 2rem;
}
.memory-list {
  margin-top: 1rem;
}
.memory-item {
  padding: 1rem;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}
.memory-content {
  margin-bottom: 0.5rem;
}
.memory-meta {
  font-size: 0.75rem;
  color: #71717a;
}
</style>