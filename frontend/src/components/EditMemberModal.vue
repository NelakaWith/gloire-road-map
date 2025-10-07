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
      :validateOnValueUpdate="true"
    >
      <div class="flex flex-col gap-2 mb-4">
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

      <div class="flex flex-col gap-2 mb-4">
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

      <div class="flex flex-col gap-2 mb-4">
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

      <div class="flex flex-col gap-2 mb-4">
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
import { yupResolver } from "@primevue/forms/resolvers/yup";
import * as yup from "yup";

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

// Yup schema and resolver
const schema = yup.object({
  memberName: yup
    .string()
    .required("Member name is required.")
    .trim()
    .min(2, "Member name must be at least 2 characters."),
  contactNumber: yup
    .string()
    .transform((v) => (v === null || v === undefined ? "" : String(v)))
    .trim()
    .test("contact-format", "Contact number looks too short.", (val) => {
      if (!val) return true; // optional
      const cleaned = val.replace(/[^0-9+()\-\s]/g, "");
      return cleaned.length >= 7;
    }),
  address: yup
    .string()
    .transform((v) => (v === null || v === undefined ? "" : String(v)))
    .max(1000, "Address is too long."),
  dateOfBirth: yup
    .mixed()
    .nullable()
    .transform((value, originalValue) => {
      // normalize empty strings to null
      if (
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined
      ) {
        return null;
      }
      // if it's already a Date, keep it
      if (originalValue instanceof Date) return originalValue;
      // try to parse strings/numbers
      const d = new Date(originalValue);
      return isNaN(d.getTime()) ? originalValue : d;
    })
    .test("is-date", "Invalid date of birth.", (val) => {
      if (val === null || val === undefined || val === "") return true; // optional
      if (!(val instanceof Date)) return false;
      return !isNaN(val.getTime());
    })
    .test("not-in-future", "Date of birth cannot be in the future.", (val) => {
      if (val === null || val === undefined || val === "") return true;
      if (!(val instanceof Date)) return false;
      const today = new Date();
      return val <= today;
    }),
});

// Use PrimeVue's yupResolver which returns a resolver function compatible with Form
const resolver = yupResolver(schema);

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
