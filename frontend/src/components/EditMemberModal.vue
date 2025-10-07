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

      <div class="flex flex-col gap-2">
        <label for="contactNumber" class="text-sm font-medium text-gray-700">
          Contact Number
        </label>
        <div>
          <InputText
            id="contactNumber"
            name="contactNumber"
            placeholder="Phone or mobile number"
            fluid
          />
          <Message
            v-if="$form.contactNumber?.invalid"
            severity="error"
            size="small"
            variant="simple"
            >{{ $form.contactNumber.error?.message }}</Message
          >
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label for="address" class="text-sm font-medium text-gray-700">
          Address
        </label>
        <div>
          <Textarea
            id="address"
            name="address"
            placeholder="Street, city, country"
            rows="3"
            autoResize
            class="w-full"
          />
          <Message
            v-if="$form.address?.invalid"
            severity="error"
            size="small"
            variant="simple"
            >{{ $form.address.error?.message }}</Message
          >
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label for="dateOfBirth" class="text-sm font-medium text-gray-700">
          Date of Birth
        </label>
        <div>
          <DatePicker
            id="dateOfBirth"
            name="dateOfBirth"
            dateFormat="yy-mm-dd"
            showIcon
            class="w-full"
          />
          <Message
            v-if="$form.dateOfBirth?.invalid"
            severity="error"
            size="small"
            variant="simple"
            >{{ $form.dateOfBirth.error?.message }}</Message
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
  contactNumber: "",
  address: "",
  dateOfBirth: "",
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

  // contact number is optional but if present should be sensible
  if (values.contactNumber && values.contactNumber.trim()) {
    const cleaned = values.contactNumber.replace(/[^0-9+()-\s]/g, "");
    if (cleaned.length < 7) {
      errors.contactNumber = [{ message: "Contact number looks too short." }];
    }
  }

  // address optional, but limit length
  if (values.address && values.address.length > 1000) {
    errors.address = [{ message: "Address is too long." }];
  }

  // dateOfBirth optional, but if provided must be a valid date and not in the future
  if (
    values.dateOfBirth !== undefined &&
    values.dateOfBirth !== null &&
    values.dateOfBirth !== ""
  ) {
    let d;
    if (values.dateOfBirth instanceof Date) {
      d = values.dateOfBirth;
    } else if (typeof values.dateOfBirth === "string") {
      const s = values.dateOfBirth.trim();
      d = s ? new Date(s) : null;
    } else {
      // try to construct a Date for other types (e.g. numeric timestamp)
      d = new Date(values.dateOfBirth);
    }

    if (!d || isNaN(d.getTime())) {
      errors.dateOfBirth = [{ message: "Invalid date of birth." }];
    } else {
      const today = new Date();
      if (d > today) {
        errors.dateOfBirth = [
          { message: "Date of birth cannot be in the future." },
        ];
      }
    }
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
      initialValues.contactNumber =
        newMember.contact_number || newMember.contactNumber || "";
      initialValues.address = newMember.address || "";
      initialValues.dateOfBirth =
        newMember.date_of_birth || newMember.dateOfBirth || "";
    }
  },
  { immediate: true }
);

const handleSubmit = ({ valid, values }) => {
  if (valid) {
    emit("save", {
      id: props.member?.id,
      name: values.memberName,
      contact_number: values.contactNumber || null,
      address: values.address || null,
      date_of_birth: values.dateOfBirth || null,
    });
  }
};

const onCancel = () => {
  emit("cancel");
};

const onHide = () => {
  // Reset form when dialog is hidden
  initialValues.memberName = "";
  initialValues.contactNumber = "";
  initialValues.address = "";
  initialValues.dateOfBirth = "";
  emit("update:show", false);
};
</script>
