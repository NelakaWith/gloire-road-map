<template>
  <div class="pb-4">
    <PageHeader title="Attendance" :showBack="true" />
    <main class="flex flex-col gap-4 mx-auto">
      <pre
        >{{ attendanceList }}
      </pre>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import PageHeader from "../components/common/PageHeader.vue";
import { authHeader } from "../utils/authHeader";
import { useToast } from "primevue/usetoast";
import axios from "axios";

const toast = useToast();

const attendanceList = ref([]);

const fetchAttendanceList = async () => {
  try {
    const response = await axios.get(`/api/attendance`, {
      headers: authHeader(),
    });
    attendanceList.value = response.data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Something went wrong :" + error.response?.status,
      detail: error,
      life: 3000,
    });
    return;
  }
};

onMounted(async () => {
  await fetchAttendanceList();
});
</script>

<style></style>
