<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Edit Member"
    class="w-1/4"
    @hide="onHide"
  >
    <Form
      v-slot="$form"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="handleSubmit"
    >
      <div class="flex flex-col gap-2">
        <label for="memberName" class="text-sm font-medium text-gray-700">
          Member Name
        </label>
        <div>
          <InputText
            id="memberName"
            name="memberName"
            placeholder="Enter member name"
            autofocus
            fluid
          />
          <Message
            v-if="$form.memberName?.invalid"
            severity="error"
            size="small"
            variant="simple"
            >{{ $form.memberName.error?.message }}</Message
          >
        </div>
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
import { reactive, computed, watch } from "vue";

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

const initialValues = reactive({
  memberName: "",
});

const resolver = ({ values }) => {
  const errors = {};

  if (!values.memberName || !values.memberName.trim()) {
    errors.memberName = [{ message: "Member name is required." }];
  } else if (values.memberName.trim().length < 2) {
    errors.memberName = [
      { message: "Member name must be at least 2 characters." },
    ];
  }

  return {
    values,
    errors,
  };
};

const visible = computed({
  get: () => props.show,
  set: (value) => emit("update:show", value),
});

// Watch for member prop changes to populate the form
watch(
  () => props.member,
  (newMember) => {
    if (newMember) {
      initialValues.memberName = newMember.name || "";
    }
  },
  { immediate: true }
);

const handleSubmit = ({ valid, values }) => {
  if (valid) {
    emit("save", {
      id: props.member?.id,
      name: values.memberName,
    });
  }
};

const onCancel = () => {
  emit("cancel");
};

const onHide = () => {
  // Reset form when dialog is hidden
  initialValues.memberName = "";
  emit("update:show", false);
};
</script>
