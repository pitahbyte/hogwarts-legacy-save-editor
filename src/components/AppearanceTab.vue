<script setup lang="ts">
import Dropdown from 'primevue/dropdown';
import FeatureRow from '@/components/FeatureRow.vue';
import type { HogwartsDB } from '@/lib/HogwartsDB';
import { computed, nextTick, type PropType } from 'vue';
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

const dirtyFeatures = ref(false);

function loadingWrapper(callback: (...args: any[]) => void | Promise<void>) {
  if (!props.hogwartsDB) {
    return;
  }

  return new Promise<void>((resolve) => {
    emit('loading', true);
    setTimeout(async () => {
      await callback();
      emit('loading', false);
      resolve();
    }, 500);
  });
}

function getAppearance() {
  loadingWrapper(async () => {
    const appearances = props.hogwartsDB!.getAppearance();
    features.value = {};
    await nextTick();
    features.value = appearances;
    dirtyFeatures.value = false;
  });
}

function getGenderOption(g: string) {
  return genderOptions.find(({ value }: DropdownOption) => {
    return value === g;
  });
}

function getGender() {
  loadingWrapper(() => {
    const currentGender = props.hogwartsDB!.getGenderSimple().toLowerCase();
    gender.value = getGenderOption(currentGender);
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
  dirtyFeatures.value = true;
  features.value[key] = value;
}

function refresh() {
  getGender();
  getAppearance();
}

function exportValues() {
  const obj = {
    features: features.value,
    gender: props.hogwartsDB?.getGenderSimple(),
  };

  downloadObjectAsJson(obj, 'appearance');
}

function importValues({ files }: { files: File[] }) {
  const [file] = files;
  const reader = new FileReader();
  reader.onload = async (event) => {
    if (!event.target) {
      return;
    }
    try {
      const obj = JSON.parse(event.target.result!.toString());
      const { features: f, gender: g } = obj;
      features.value = {};
      await nextTick();
      features.value = f;
      gender.value = getGenderOption(g.toLowerCase());

      setAppearance();
      changeGender();
    } catch (error) {
      console.error(error);
    }
  };
  reader.readAsText(file);
}

function saveChanges() {
  setAppearance();
}

const hasFeatures = computed(() => {
  return Object.keys(features.value).length > 0;
});

defineExpose({
  refresh,
});
</script>

<template>
  <div class="grid">
    <div class="col">
      <Toolbar>
        <template #start>
          <Button @click="exportValues" class="mr-2">
            <i class="pi pi-upload mr-2"></i>Export</Button
          >
          <FileUpload
            mode="basic"
            name="importAppearance"
            auto
            @uploader="importValues"
            customUpload
            chooseLabel="Import"
            chooseIcon="pi pi-download"
            uploadIcon="pi pi-download"
          />
        </template>
      </Toolbar>
      <div class="features-container mt-3">
        <h2 class="mb-2">
          Features
          <small class="text-xs"><i>AvatarFullBodyPresetsDynamic</i></small>
        </h2>
        <span v-if="!hasFeatures"><i>No features to show</i></span>
        <FeatureRow
          v-for="(value, key) in features"
          :key="key"
          :name="key"
          :feature="value"
          @value-changed="handleChange"
        ></FeatureRow>
        <Button
          v-if="hasFeatures"
          @click="saveChanges"
          :disabled="!dirtyFeatures"
          >Save</Button
        >
      </div>

      <div class="gender-container grid mt-3">
        <div class="col-4">
          <div class="field">
            <h2 class="mb-2">
              Gender <small class="text-xs"><i>MiscDataDynamic</i></small>
            </h2>
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
