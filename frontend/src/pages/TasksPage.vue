<template>
  <div class="page tasks-page">
    <h1>任务中心</h1>
    <div class="tasks-list">
      <div v-for="task in tasks" :key="task._id" class="task-item">
        <div class="task-title">{{ task.title }}</div>
        <span class="task-status" :class="task.status">{{ task.status }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tasks = ref([])
</script>

<style scoped>
.tasks-page {
  padding: 2rem;
}
.tasks-list {
  margin-top: 1rem;
}
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}
.task-status {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
}
.task-status.pending {
  background: #854d0e;
  color: #fef9c3;
}
.task-status.running {
  background: #1d4ed8;
  color: #dbeafe;
}
.task-status.completed {
  background: #166534;
  color: #bbf7d0;
}
</style>