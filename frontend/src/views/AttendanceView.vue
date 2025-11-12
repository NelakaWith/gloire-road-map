<template>
  <div class="pb-4">
    <PageHeader title="Attendance" :showBack="true">
      <template #actions>
        <Button
          @click="showMarkingDialog = true"
          label="Mark Attendance"
          icon="pi pi-plus"
        />
      </template>
    </PageHeader>

    <main class="flex flex-col gap-4 mx-auto">
      <!-- Date Filter & Session Overview -->
      <Card>
        <template #content>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Session Overview</h3>
            <div class="flex items-center gap-2">
              <label>Date:</label>
              <DatePicker
                v-model="selectedDate"
                @date-select="loadSessionData"
                dateFormat="yy-mm-dd"
                showIcon
              />
              <Button
                @click="loadSessionData"
                icon="pi pi-refresh"
                size="small"
                severity="secondary"
              />
            </div>
          </div>
          <div class="grid grid-cols-4 gap-4" v-if="stats">
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">
                {{ stats.present || 0 }}
              </div>
              <div class="text-sm text-gray-600">Present</div>
            </div>
            <div class="text-center p-4 bg-red-50 rounded-lg">
              <div class="text-2xl font-bold text-red-600">
                {{ stats.absent || 0 }}
              </div>
              <div class="text-sm text-gray-600">Absent</div>
            </div>
            <div class="text-center p-4 bg-yellow-50 rounded-lg">
              <div class="text-2xl font-bold text-yellow-600">
                {{ stats.late || 0 }}
              </div>
              <div class="text-sm text-gray-600">Late</div>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">
                {{ stats.excused || 0 }}
              </div>
              <div class="text-sm text-gray-600">Excused</div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Attendance Records Table -->
      <Card>
        <template #content>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Attendance Records</h3>
            <div class="flex gap-2">
              <DatePicker
                v-model="filterDate"
                @date-select="filterRecords"
                dateFormat="yy-mm-dd"
                placeholder="Filter by date"
                showIcon
                :showClear="true"
              />
            </div>
          </div>

          <DataTable
            :value="attendanceList"
            paginator
            :rows="10"
            :loading="loading"
            filterDisplay="menu"
            :globalFilterFields="['Student.name', 'status', 'date']"
          >
            <Column field="Student.name" header="Student" sortable>
              <template #body="{ data }">
                <div class="font-medium">
                  {{ data.student.name || "Unknown" }}
                </div>
              </template>
            </Column>
            <Column field="date" header="Date" sortable>
              <template #body="{ data }">
                <div>{{ formatDate(data.date) }}</div>
              </template>
            </Column>
            <Column field="status" header="Status" sortable>
              <template #body="{ data }">
                <Tag
                  :value="data.status"
                  :severity="getStatusSeverity(data.status)"
                />
              </template>
            </Column>
            <Column field="notes" header="Notes">
              <template #body="{ data }">
                <div class="max-w-xs truncate" :title="data.notes">
                  {{ data.notes || "-" }}
                </div>
              </template>
            </Column>
            <Column header="Actions" :exportable="false">
              <template #body="{ data }">
                <Button
                  icon="pi pi-pencil"
                  size="small"
                  severity="info"
                  @click="editAttendance(data)"
                  class="mr-2"
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  @click="deleteAttendance(data)"
                />
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </main>

    <!-- Attendance Marking Dialog -->
    <AttendanceMarkingDialog
      v-model:visible="showMarkingDialog"
      :selected-date="selectedDate"
      @attendance-marked="onAttendanceMarked"
    />

    <!-- Edit Dialog -->
    <Dialog v-model:visible="showEditDialog" header="Edit Attendance" modal>
      <div class="flex flex-col gap-4" style="min-width: 300px">
        <div>
          <label class="block text-sm font-medium mb-1">Student:</label>
          <div class="font-semibold">{{ editingRecord?.Student?.name }}</div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Date:</label>
          <div>{{ formatDate(editingRecord?.date) }}</div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Status:</label>
          <Dropdown
            v-model="editingRecord.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Notes:</label>
          <Textarea
            v-model="editingRecord.notes"
            rows="3"
            class="w-full"
            placeholder="Optional notes"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="showEditDialog = false"
        />
        <Button label="Save" @click="saveEdit" :loading="saving" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useConfirm } from "primevue/useconfirm";
import PageHeader from "../components/common/PageHeader.vue";
import AttendanceMarkingDialog from "../components/attendance/AttendanceMarkingDialog.vue";
import { useToast } from "primevue/usetoast";
import axios from "../utils/axios";

const toast = useToast();
const confirm = useConfirm();

const attendanceList = ref([]);
const selectedDate = ref(new Date());
const filterDate = ref(null);
const loading = ref(false);
const showMarkingDialog = ref(false);
const showEditDialog = ref(false);
const editingRecord = ref({});
const saving = ref(false);

const statusOptions = [
  { label: "Present", value: "present" },
  { label: "Absent", value: "absent" },
  { label: "Late", value: "late" },
  { label: "Excused", value: "excused" },
];

// Computed stats from current attendance list
const stats = computed(() => {
  if (!attendanceList.value.length) return null;

  const counts = attendanceList.value.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {});

  return {
    present: counts.present || 0,
    absent: counts.absent || 0,
    late: counts.late || 0,
    excused: counts.excused || 0,
  };
});

/**
 * Fetch attendance records from the API.
 *
 * Inputs:
 *  - date (Date|null): optional Date object to filter attendance for a specific day.
 *
 * Behavior:
 *  - When a date is provided, it is formatted for the API using `formatDateForAPI`.
 *  - Calls GET /api/attendance with auth headers and optional `date` query param.
 *  - Updates `attendanceList` with the response data and manages `loading` state.
 *
 * Error modes:
 *  - On network or server error, shows a toast with an error message.
 */
const fetchAttendanceList = async (date = null) => {
  loading.value = true;
  try {
    const params = {};
    if (date) {
      params.date = formatDateForAPI(date);
    }

    const response = await axios.get("/api/attendance", {
      params,
    });
    attendanceList.value = response.data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to load attendance records",
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

const loadSessionData = () => {
  if (selectedDate.value) {
    fetchAttendanceList(selectedDate.value);
  }
};

const filterRecords = () => {
  fetchAttendanceList(filterDate.value);
};

const onAttendanceMarked = () => {
  showMarkingDialog.value = false;
  loadSessionData();
  toast.add({
    severity: "success",
    summary: "Success",
    detail: "Attendance marked successfully",
    life: 3000,
  });
};

const editAttendance = (record) => {
  editingRecord.value = { ...record };
  showEditDialog.value = true;
};

const saveEdit = async () => {
  saving.value = true;
  try {
    await axios.patch(`/api/attendance/${editingRecord.value.id}`, {
      status: editingRecord.value.status,
      notes: editingRecord.value.notes,
    });

    showEditDialog.value = false;
    loadSessionData();
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Attendance updated successfully",
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to update attendance",
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
};

const deleteAttendance = (record) => {
  confirm.require({
    message: `Are you sure you want to delete this attendance record for ${record.Student?.name}?`,
    header: "Confirm Deletion",
    icon: "pi pi-exclamation-triangle",
    rejectProps: {
      label: "Cancel",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Delete",
      severity: "danger",
    },
    accept: async () => {
      try {
        await axios.delete(`/api/attendance/${record.id}`);
        loadSessionData();
        toast.add({
          severity: "success",
          summary: "Success",
          detail: "Attendance record deleted",
          life: 3000,
        });
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete attendance record",
          life: 3000,
        });
      }
    },
  });
};

const getStatusSeverity = (status) => {
  const severityMap = {
    present: "success",
    absent: "danger",
    late: "warn",
    excused: "info",
  };
  return severityMap[status] || "secondary";
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
};

const formatDateForAPI = (date) => {
  if (!date) return null;
  // Use local date formatting to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

onMounted(async () => {
  await fetchAttendanceList();
});
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
