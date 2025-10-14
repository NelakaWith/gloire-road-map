<template>
  <Dialog
    v-model:visible="dialogVisible"
    header="Mark Session Attendance"
    :style="{ width: '90vw', maxWidth: '1200px' }"
    modal
    :closable="!saving"
  >
    <div class="flex flex-col gap-4">
      <!-- Date Selection -->
      <div class="flex items-center gap-4">
        <label class="font-medium">Session Date:</label>
        <DatePicker
          v-model="sessionDate"
          dateFormat="yy-mm-dd"
          @date-select="loadStudentSheet"
          showIcon
          :disabled="saving"
        />
        <Button
          @click="loadStudentSheet"
          icon="pi pi-refresh"
          size="small"
          severity="secondary"
          :disabled="!sessionDate || saving"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <ProgressSpinner />
        <p class="mt-2">Loading students...</p>
      </div>

      <!-- Quick Actions -->
      <div
        v-else-if="students.length"
        class="flex gap-2 p-3 bg-gray-50 rounded-lg"
      >
        <Button
          @click="markAllPresent"
          label="Mark All Present"
          severity="success"
          size="small"
          icon="pi pi-check"
          :disabled="saving"
        />
        <Button
          @click="clearAll"
          label="Clear All"
          severity="secondary"
          size="small"
          icon="pi pi-times"
          :disabled="saving"
        />
        <div class="ml-auto flex items-center gap-2">
          <span class="text-sm text-gray-600"
            >{{ getMarkedCount() }} of {{ students.length }} marked</span
          >
        </div>
      </div>

      <!-- Student Grid -->
      <div
        v-if="students.length"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto"
      >
        <div
          v-for="student in students"
          :key="student.student_id"
          class="border rounded-lg p-4 transition-all"
          :class="{
            'border-green-300 bg-green-50': student.status === 'present',
            'border-red-300 bg-red-50': student.status === 'absent',
            'border-yellow-300 bg-yellow-50': student.status === 'late',
            'border-blue-300 bg-blue-50': student.status === 'excused',
            'border-gray-300': student.status === 'not_marked',
          }"
        >
          <h4 class="font-semibold mb-3 text-gray-800">{{ student.name }}</h4>

          <div class="grid grid-cols-2 gap-2 mb-3">
            <Button
              @click="setStatus(student, 'present')"
              :severity="student.status === 'present' ? 'success' : 'secondary'"
              :outlined="student.status !== 'present'"
              size="small"
              label="Present"
              class="w-full"
              :disabled="saving"
            />
            <Button
              @click="setStatus(student, 'absent')"
              :severity="student.status === 'absent' ? 'danger' : 'secondary'"
              :outlined="student.status !== 'absent'"
              size="small"
              label="Absent"
              class="w-full"
              :disabled="saving"
            />
            <Button
              @click="setStatus(student, 'late')"
              :severity="student.status === 'late' ? 'warning' : 'secondary'"
              :outlined="student.status !== 'late'"
              size="small"
              label="Late"
              class="w-full"
              :disabled="saving"
            />
            <Button
              @click="setStatus(student, 'excused')"
              :severity="student.status === 'excused' ? 'info' : 'secondary'"
              :outlined="student.status !== 'excused'"
              size="small"
              label="Excused"
              class="w-full"
              :disabled="saving"
            />
          </div>

          <Textarea
            v-if="student.status !== 'not_marked'"
            v-model="student.notes"
            placeholder="Notes (optional)"
            rows="2"
            class="w-full text-sm"
            :disabled="saving"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="text-center py-8 text-gray-500">
        <i class="pi pi-users text-4xl mb-4"></i>
        <p>No students found. Please select a date and try again.</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <div class="text-sm text-gray-600">
          <span v-if="students.length"
            >{{ getMarkedCount() }} of {{ students.length }} students
            marked</span
          >
        </div>
        <div class="flex gap-2">
          <Button
            label="Cancel"
            severity="secondary"
            @click="closeDialog"
            :disabled="saving"
          />
          <Button
            label="Save Attendance"
            @click="saveAttendance"
            :loading="saving"
            :disabled="!hasChanges"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useToast } from "primevue/usetoast";
import { authHeader } from "../../utils/authHeader";
import axios from "axios";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  selectedDate: {
    type: Date,
    default: () => new Date(),
  },
});

const emit = defineEmits(["update:visible", "attendance-marked"]);

const toast = useToast();

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const sessionDate = ref(new Date(props.selectedDate));
const students = ref([]);
const loading = ref(false);
const saving = ref(false);
const originalData = ref([]);

// Watch for prop changes
watch(
  () => props.selectedDate,
  (newDate) => {
    if (newDate) {
      sessionDate.value = new Date(newDate);
    }
  }
);

watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible && sessionDate.value) {
      loadStudentSheet();
    }
  }
);

const loadStudentSheet = async () => {
  if (!sessionDate.value) return;

  loading.value = true;
  try {
    const dateStr = sessionDate.value.toISOString().split("T")[0];
    const response = await axios.get(`/api/attendance/sheet/${dateStr}`, {
      headers: authHeader(),
    });

    students.value = response.data.map((student) => ({
      ...student,
      notes: student.notes || "",
    }));

    // Store original data for change detection
    originalData.value = JSON.parse(JSON.stringify(students.value));
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to load student attendance sheet",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const setStatus = (student, status) => {
  student.status = status;
  if (status === "not_marked") {
    student.notes = "";
  }
};

const markAllPresent = () => {
  students.value.forEach((student) => {
    student.status = "present";
    student.notes = "";
  });
};

const clearAll = () => {
  students.value.forEach((student) => {
    student.status = "not_marked";
    student.notes = "";
  });
};

const getMarkedCount = () => {
  return students.value.filter((s) => s.status !== "not_marked").length;
};

const hasChanges = computed(() => {
  if (!originalData.value.length || !students.value.length) return false;

  return students.value.some((student, index) => {
    const original = originalData.value[index];
    return (
      student.status !== original.status || student.notes !== original.notes
    );
  });
});

const saveAttendance = async () => {
  if (!sessionDate.value) return;

  saving.value = true;
  try {
    // Prepare attendance records (only for students that are marked)
    const attendanceRecords = students.value
      .filter((student) => student.status !== "not_marked")
      .map((student) => ({
        student_id: student.student_id,
        status: student.status,
        notes: student.notes || null,
      }));

    if (attendanceRecords.length === 0) {
      toast.add({
        severity: "warn",
        summary: "Warning",
        detail: "Please mark at least one student before saving",
        life: 3000,
      });
      return;
    }

    const dateStr = sessionDate.value.toISOString().split("T")[0];

    await axios.post(
      "/api/attendance/session",
      {
        date: dateStr,
        attendance_records: attendanceRecords,
      },
      {
        headers: authHeader(),
      }
    );

    emit("attendance-marked");

    toast.add({
      severity: "success",
      summary: "Success",
      detail: `Attendance marked for ${attendanceRecords.length} students`,
      life: 3000,
    });
  } catch (error) {
    console.error("Save attendance error:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data?.message || "Failed to save attendance",
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
};

const closeDialog = () => {
  if (hasChanges.value && !saving.value) {
    // Could add confirmation dialog here
  }
  dialogVisible.value = false;
};
</script>

<style scoped>
.transition-all {
  transition: all 0.2s ease;
}
</style>
