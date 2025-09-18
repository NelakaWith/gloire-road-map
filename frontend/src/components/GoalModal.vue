<template>
  <Dialog
    v-model:visible="visible"
    modal
    class="w-full max-w-md"
    @hide="onHide"
  >
    <template #header>
      <h3 class="text-lg font-bold mb-0 text-indigo-700">
        <span v-if="mode === 'view'">Goal Details</span>
        <span v-else-if="mode === 'edit'">Edit Goal</span>
        <span v-else>Add Goal</span>
      </h3>
    </template>

    <div v-if="mode !== 'view'">
      <Form
        v-slot="$form"
        :initialValues="initialValues"
        :resolver="resolver"
        @submit="handleSubmit"
      >
        <div class="mb-3">
          <label class="block text-sm font-medium">Title</label>
          <InputText name="title" class="w-full" />
          <Message
            v-if="$form.title?.invalid"
            severity="error"
            size="small"
            variant="simple"
            >{{ $form.title.error?.message }}</Message
          >
        </div>

        <div class="mb-3">
          <label class="block text-sm font-medium">Description</label>
          <Textarea name="description" class="w-full" rows="4" />
        </div>

        <div class="mb-3">
          <label class="block text-sm font-medium">Target Date</label>
          <DatePicker
            name="target_date"
            class="w-full"
            dateFormat="yy-mm-dd"
            dataType="string"
            showIcon
          />
        </div>

        <div class="flex gap-2 mt-4 justify-end">
          <Button
            label="Save"
            type="submit"
            icon="pi pi-check"
            class="p-button-primary"
          />
          <Button label="Cancel" class="p-button-secondary" @click="onCancel" />
        </div>
      </Form>
    </div>

    <div v-else>
      <div class="mb-2">
        <span class="font-semibold">Title:</span> {{ form.title }}
      </div>
      <div class="mb-2">
        <span class="font-semibold">Description:</span>
        {{ form.description ? form.description : "-" }}
      </div>
      <div class="mb-2">
        <span class="font-semibold">Target Date:</span>
        {{ form.target_date ? form.target_date : "-" }}
      </div>
      <div class="mb-2">
        <span class="font-semibold">Setup Date:</span>
        {{ form.setup_date ? form.setup_date.split("T")[0] : "-" }}
      </div>
      <div class="mb-2">
        <span class="font-semibold">Last Updated:</span>
        {{ form.updated_at ? form.updated_at.split("T")[0] : "-" }}
      </div>
      <div class="flex gap-2 mt-4 justify-end">
        <Button
          label="Edit"
          icon="pi pi-pencil"
          class="p-button"
          @click="$emit('edit')"
        />
        <Button
          label="Delete"
          icon="pi pi-trash"
          class="p-button-danger"
          @click="$emit('delete')"
        />
        <Button label="Close" class="p-button-secondary" @click="onCancel" />
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { reactive, watch, computed, toRefs } from "vue";
const props = defineProps({
  show: Boolean,
  mode: String, // 'view', 'edit', 'add'
  goal: Object,
});
const emit = defineEmits(["close", "save", "edit", "delete", "update:show"]);
const form = reactive({
  title: "",
  description: "",
  target_date: "",
  setup_date: "",
  updated_at: "",
});

// initialValues for the Form component
const initialValues = reactive({
  title: "",
  description: "",
  target_date: "",
});

// simple resolver: title required and at least 5 chars
const resolver = ({ values }) => {
  const errors = {};
  if (!values.title || !String(values.title).trim()) {
    errors.title = [{ message: "Title is required." }];
  } else if (String(values.title).trim().length < 5) {
    errors.title = [{ message: "Title must be at least 5 characters." }];
  }
  return { values, errors };
};
watch(
  () => props.goal,
  (g) => {
    if (g) {
      form.title = g.title || "";
      form.description = g.description || "";
      form.target_date = g.target_date ? g.target_date.split("T")[0] : "";
      // sync initialValues used by the Form
      initialValues.title = g.title || "";
      initialValues.description = g.description || "";
      initialValues.target_date = g.target_date
        ? g.target_date.split("T")[0]
        : "";
      form.setup_date = g.setup_date || "";
      form.updated_at = g.updated_at || "";
    } else {
      form.title = "";
      form.description = "";
      form.target_date = "";
      initialValues.title = "";
      initialValues.description = "";
      initialValues.target_date = "";
      form.setup_date = "";
      form.updated_at = "";
    }
  },
  { immediate: true }
);
const handleSubmit = ({ valid, values }) => {
  if (!valid) return;
  emit("save", { ...values });
};

const visible = computed({
  get: () => props.show,
  set: (v) => emit("update:show", v),
});

const onHide = () => {
  initialValues.title = "";
  initialValues.description = "";
  initialValues.target_date = "";
  emit("update:show", false);
};

const onCancel = () => {
  emit("update:show", false);
  emit("close");
};
</script>
