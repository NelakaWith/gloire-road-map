<template>
  <div class="p-4 bg-white rounded shadow">
    <div class="text-gray-600 mb-2">Top Students</div>
    <div
      v-if="!students || students.length === 0"
      class="text-sm text-gray-500"
    >
      No data
    </div>
    <table v-else class="w-full text-sm">
      <thead>
        <tr class="text-left">
          <th>Student</th>
          <th>Completions</th>
          <th>Avg days</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in students" :key="s.student_id">
          <td>{{ s.student_name || s.student_id }}</td>
          <td>{{ s.completions }}</td>
          <td>{{ s.avg_days }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({ students: { type: Array, default: () => [] } });
</script>
