<script setup lang="ts">
import AppearanceTab from '@/components/AppearanceTab.vue';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import SaveFile from '@/lib/SaveFile.js';
import HogwartsDB from '@/lib/HogwartsDB';
import { nextTick, ref } from 'vue';

const saveFile = ref<SaveFile>();

const hogwartsDB = ref<HogwartsDB>();

const appearanceTabRef = ref<InstanceType<typeof AppearanceTab> | null>(null);

const isFileLoaded = ref(false);

const fileLoading = ref(false);

function refresh() {
  appearanceTabRef.value!.refresh();
}

function setLoading(value: boolean) {
  fileLoading.value = value;
}

function openSaveFile({ files }: { files: File[] }) {
  const [myFile] = files;
  fileLoading.value = true;

  const reader = new FileReader();
  reader.readAsArrayBuffer(myFile);
  reader.onloadend = async function (evt) {
    if (!evt.target) {
      return;
    }
    if (evt.target.readyState == FileReader.DONE) {
      const arrayBuffer = evt.target.result;
      saveFile.value = new SaveFile(arrayBuffer, myFile.name);
      hogwartsDB.value = new HogwartsDB(saveFile.value.primaryDB.slice());
      isFileLoaded.value = true;
      await nextTick();
      setTimeout(async () => {
        fileLoading.value = false;
        await nextTick();
        refresh();
      }, 500);
    }
  };
  reader.onerror = () => {
    fileLoading.value = false;
  };
}

function promptDownload(
  byteArray: Uint8Array,
  fileName: string,
  type: string = 'application/octet-stream'
) {
  const blob = new Blob([byteArray], { type });
  const url = URL.createObjectURL(blob);
  const anchorTag = document.createElement('a');
  anchorTag.href = url;
  anchorTag.download = fileName;
  document.body.appendChild(anchorTag);
  anchorTag.style.display = 'none';
  anchorTag.click();
  anchorTag.remove();
}

function downloadSaveFile() {
  if (saveFile.value && hogwartsDB.value) {
    const dbByteArray = saveFile.value.generateSaveFile(
      hogwartsDB.value.getDBBytes()
    );
    promptDownload(dbByteArray, `${saveFile.value.name}`);
  }
}
</script>

<template>
  <main class="app grid-nogutter">
    <div class="col">
      <nav class="col-12 grid">
        <div class="col-2">
          <FileUpload
            mode="basic"
            name="saveFile"
            auto
            @uploader="openSaveFile"
            customUpload
            chooseLabel="Browse"
          />
        </div>
        <div class="col-2 col-offset-8">
          <Button @click="refresh" class="mr-2"
            ><i class="pi pi-refresh"></i
          ></Button>
          <Button @click="downloadSaveFile"
            ><i class="pi pi-download"></i>
          </Button>
        </div>
      </nav>
      <TabView v-if="isFileLoaded">
        <TabPanel header="Appearance"
          ><AppearanceTab
            ref="appearanceTabRef"
            :hogwartsDB="hogwartsDB"
            @loading="setLoading"
          ></AppearanceTab>
        </TabPanel>
      </TabView>
      <div class="loading-overlay" v-if="fileLoading">
        <div class="text-center">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
