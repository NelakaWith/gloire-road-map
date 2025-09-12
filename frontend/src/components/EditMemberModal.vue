<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Edit Member"
    class="w-1/4"
    @hide="onHide"
  >
    <Form @submit="handleSubmit">
      <div class="flex flex-col gap-2">
        <label for="memberName" class="text-sm font-medium text-gray-700">
          Member Name
        </label>
        <InputText
          id="memberName"
          name="memberName"
          :class="{ 'p-invalid': nameError }"
          placeholder="Enter member name"
          autofocus
        />
        <small v-if="nameError" class="text-red-500">{{ nameError }}</small>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="onCancel"
        />
        <Button
          type="submit"
          label="Save"
          icon="pi pi-check"
          :loading="loading"
        />
      </div>
    </Form>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  member: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:show", "save", "cancel"]);

const memberName = ref("");
const nameError = ref("");

const visible = computed({
  get: () => props.show,
  set: (value) => emit("update:show", value),
});

// Watch for member prop changes to populate the form
watch(
  () => props.member,
  (newMember) => {
    if (newMember) {
      memberName.value = newMember.name || "";
      nameError.value = "";
    }
  },
  { immediate: true }
);

const validateName = () => {
  nameError.value = "";

  if (!memberName.value.trim()) {
    nameError.value = "Member name is required";
    return false;
  }

  if (memberName.value.trim().length < 2) {
    nameError.value = "Member name must be at least 3 characters";
    return false;
  }

  return true;
};

const handleSubmit = () => {
  if (validateName()) {
    emit("save", {
      id: props.member?.id,
      name: memberName.value.trim(),
    });
  }
};

const onCancel = () => {
  emit("cancel");
};

const onHide = () => {
  // Reset form when dialog is hidden
  memberName.value = "";
  nameError.value = "";
  emit("update:show", false);
};
</script>
