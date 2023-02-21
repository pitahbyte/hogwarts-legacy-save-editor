<script setup lang="ts">
// import TheWelcome from './components/TheWelcome.vue';
import FileUpload from 'primevue/fileupload';
import SaveFile from '@/lib/SaveFile.js';
import HogwartsDB from '@/lib/HogwartsDB';
import { ref } from 'vue';

const saveFile = ref();

const hogwartsDB = ref();

function uploadSaveFile({ files }: { files: File[] }) {
  const [myFile] = files;

  const reader = new FileReader();
  // const fileByteArray = [];
  reader.readAsArrayBuffer(myFile);
  reader.onloadend = function (evt) {
    if (!evt.target) {
      return;
    }

    if (evt.target.readyState == FileReader.DONE) {
      const arrayBuffer = evt.target.result;
      saveFile.value = new SaveFile(arrayBuffer);
      hogwartsDB.value = new HogwartsDB(saveFile.value.primaryDB.slice());
      // console.log(hog);
      // hog.setGender('female');
      // console.log(hog.getGender());
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
      @uploader="uploadSaveFile"
      customUpload
    >
    </FileUpload>
  </main>
</template>

<style module lang="scss"></style>
