<script setup lang="ts">
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import type HogwartsDB from '@/lib/HogwartsDB';
import type { PropType } from 'vue';
import { ref } from 'vue';

interface DropdownOption {
  name: string;
  value: string;
}

interface DataRow {
  name: string;
  value: string;
}

const props = defineProps({
  hogwartsDB: { type: Object as PropType<HogwartsDB>, required: false },
});

const loading = ref(false);

const gender = ref<DropdownOption>();

const genderOptions: DropdownOption[] = [
  {
    name: 'Male',
    value: 'male',
  },
  {
    name: 'Female',
    value: 'female',
  },
];

const features = ref<DataRow[]>([]);

function updateGender() {
  if (!props.hogwartsDB) {
    return;
  }

  loading.value = true;
  setTimeout(() => {
    const currentGender = props.hogwartsDB!.getGenderSimple().toLowerCase();
    gender.value = genderOptions.find(({ value }: DropdownOption) => {
      return value === currentGender;
    });
    loading.value = false;
  }, 500);
}

function changeGender() {
  if (props.hogwartsDB && gender.value) {
    loading.value = true;
    setTimeout(() => {
      props.hogwartsDB?.setGender(gender.value?.value);
      loading.value = false;
    }, 500);
  }
}

defineExpose({
  updateGender,
});
</script>

<template>
  <div class="grid">
    <div class="card col">
      <div class="features-container">
        <h2>Features</h2>
        <span v-if="!features.length"><i>No features to show</i></span>
        <div
          class="features grid p-fluid"
          v-for="feature in features"
          :key="feature.name"
        >
          <div class="col-12 md:col-4">
            <div class="p-inputgroup">
              <span class="p-inputgroup-addon">
                <i class="pi pi-book"></i>
              </span>
              <InputText />
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="p-inputgroup">
              <span class="p-inputgroup-addon">
                <i class="pi pi-pencil"></i>
              </span>
              <InputText />
            </div>
          </div>
          <div class="col-12 md:col-4"></div>
        </div>
      </div>

      <div class="gender-container grid">
        <div class="col-4">
          <div class="field">
            <h3>Gender</h3>
            <Dropdown
              v-model="gender"
              :options="genderOptions"
              optionLabel="name"
              placeholder="Not selected"
              :loading="loading"
              :disabled="!hogwartsDB"
              @change="changeGender"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
