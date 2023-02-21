<script setup lang="ts">
// import TheWelcome from './components/TheWelcome.vue';
import FileUpload from 'primevue/fileupload';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import SaveFile from '@/lib/SaveFile.js';
import HogwartsDB from '@/lib/HogwartsDB';
import { ref } from 'vue';

interface DropdownOption {
  name: string;
  value: string;
}

const saveFile = ref();

const hogwartsDB = ref();

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

const gender = ref<DropdownOption>();

const loading = ref(false);

function updateGender() {
  if (!hogwartsDB.value) {
    return;
  }
  loading.value = true;
  setTimeout(() => {
    const currentGender = hogwartsDB.value.getGenderSimple().toLowerCase();
    gender.value = genderOptions.find(({ value }: DropdownOption) => {
      return value === currentGender;
    });
    loading.value = false;
  }, 500);
}

function refresh() {
  updateGender();
}

function changeGender() {
  if (hogwartsDB.value && gender.value) {
    loading.value = true;
    setTimeout(() => {
      hogwartsDB.value.setGender(gender.value?.value);
      loading.value = false;
    }, 500);
  }
}

function openSaveFile({ files }: { files: File[] }) {
  const [myFile] = files;

  const reader = new FileReader();
  reader.readAsArrayBuffer(myFile);
  reader.onloadend = function (evt) {
    if (!evt.target) {
      return;
    }
    if (evt.target.readyState == FileReader.DONE) {
      const arrayBuffer = evt.target.result;
      saveFile.value = new SaveFile(arrayBuffer);
      hogwartsDB.value = new HogwartsDB(saveFile.value.primaryDB.slice());
      updateGender();
    }
  };
}
</script>

<template>
  <main>
    <FileUpload
      mode="basic"
      name="saveFile"
      auto
      @uploader="openSaveFile"
      customUpload
      chooseLabel="Browse"
    />
    <Button @click="refresh">Refresh</Button>
    <Dropdown
      v-model="gender"
      :options="genderOptions"
      optionLabel="name"
      placeholder="Not selected"
      :loading="loading"
      :disabled="!hogwartsDB"
      @change="changeGender"
    />
  </main>
</template>

<style module lang="scss"></style>
