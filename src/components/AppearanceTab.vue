<script setup lang="ts">
import Dropdown from 'primevue/dropdown';
import FeatureRow from '@/components/FeatureRow.vue';
import type { HogwartsDB } from '@/lib/HogwartsDB';
import type { PropType } from 'vue';
import { ref } from 'vue';
import { downloadObjectAsJson } from '@/lib/utils';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';

interface DropdownOption {
  name: string;
  value: string;
}

const emit = defineEmits(['loading']);

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

const features = ref<Record<string, string>>({});

function loadingWrapper(callback: (...args: any[]) => void) {
  if (!props.hogwartsDB) {
    return;
  }

  return new Promise<void>((resolve) => {
    emit('loading', true);
    setTimeout(() => {
      callback();
      emit('loading', false);
      resolve();
    }, 500);
  });
}

function getAppearance() {
  loadingWrapper(() => {
    const appearances = props.hogwartsDB!.getAppearance();
    features.value = appearances;
  });
}

function getGender() {
  loadingWrapper(() => {
    const currentGender = props.hogwartsDB!.getGenderSimple().toLowerCase();
    gender.value = genderOptions.find(({ value }: DropdownOption) => {
      return value === currentGender;
    });
  });
}

function changeGender() {
  if (props.hogwartsDB && gender.value) {
    props.hogwartsDB?.setGender(gender.value?.value);
    getGender();
  }
}

function setAppearance() {
  if (props.hogwartsDB) {
    props.hogwartsDB.setAppearance(features.value);
    refresh();
  }
}

function handleChange({ key, value }: { key: string; value: string }) {
  console.log({ key, value });
  // features[key] = value;
  features.value[key] = value;
}

function refresh() {
  getGender();
  getAppearance();
}

function exportValues() {
  const obj = {
    features: features.value,
    gender: props.hogwartsDB!.getGender(),
  };

  downloadObjectAsJson(obj, 'appearance');
}

function importValues() {}

defineExpose({
  refresh,
});
</script>

<template>
  <div class="grid">
    <div class="card col">
      <Toolbar>
        <template #start>
          <Button @click="exportValues">
            <i class="pi pi-download mr-2"></i>Export</Button
          >
          <FileUpload
            mode="basic"
            name="importAppearance"
            auto
            @uploader="importValues"
            customUpload
            chooseLabel="Import"
          />
        </template>
      </Toolbar>
      <div class="features-container">
        <h2>
          Features
          <small class="text-xs"><i>AvatarFullBodyPresetsDynamic</i></small>
        </h2>
        <span v-if="!Object.keys(features).length"
          ><i>No features to show</i></span
        >
        <FeatureRow
          v-for="(value, key) in features"
          :key="key"
          :name="key"
          :feature="value"
          @value-changed="handleChange"
        ></FeatureRow>
      </div>

      <button @click="setAppearance">setAppearance</button>

      <div class="gender-container grid">
        <div class="col-4">
          <div class="field">
            <h3>
              Gender <small class="text-xs"><i>MiscDataDynamic</i></small>
            </h3>
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
