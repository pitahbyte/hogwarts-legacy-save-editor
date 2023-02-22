<script setup lang="ts">
import AppearanceTab from '@/components/AppearanceTab.vue';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import HelpDialog from '@/components/HelpDialog.vue';
import Card from 'primevue/card';
// import TabView from 'primevue/tabview';
// import TabPanel from 'primevue/tabpanel';
import SaveFile from '@/lib/SaveFile.js';
import HogwartsDB from '@/lib/HogwartsDB';
import { nextTick, ref } from 'vue';

const saveFile = ref<SaveFile>();

const hogwartsDB = ref<HogwartsDB>();

const appearanceTabRef = ref<InstanceType<typeof AppearanceTab> | null>(null);

const isFileLoaded = ref(false);

const fileLoading = ref(false);

const showHelp = ref(false);

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

function displayHelp() {
  showHelp.value = true;
}

function hideDialog() {
  showHelp.value = false;
}
</script>

<template>
  <main class="app grid-nogutter">
    <HelpDialog :show="showHelp" @hideDialog="hideDialog"></HelpDialog>

    <div class="col">
      <nav class="col-12 grid">
        <div class="col-12 sm:col-6 sm:text-left flex">
          <FileUpload
            class="mr-2"
            mode="basic"
            name="saveFile"
            auto
            @uploader="openSaveFile"
            customUpload
            chooseLabel="Open Save File"
          />
          <Button
            @click="downloadSaveFile"
            v-tooltip.bottom="'Download Save File'"
            :disabled="!isFileLoaded"
            ><i class="pi pi-download mr-2"></i>
            Download Save File
          </Button>
        </div>
        <div class="col-12 sm:col-4 sm:col-offset-2 text-center sm:text-right">
          <Button @click="displayHelp" class="mr-2" v-tooltip.bottom="'Help'"
            ><i class="pi pi-question"></i
          ></Button>
          <Button
            @click="refresh"
            class="mr-2"
            v-tooltip.bottom="'Refresh'"
            :disabled="!isFileLoaded"
            ><i class="pi pi-refresh"></i
          ></Button>
        </div>
      </nav>
      <div class="content">
        <AppearanceTab
          v-if="isFileLoaded"
          ref="appearanceTabRef"
          :hogwartsDB="hogwartsDB"
          @loading="setLoading"
        ></AppearanceTab>
        <!-- <TabView v-if="isFileLoaded">
          <TabPanel header="Appearance"> </TabPanel>
        </TabView> -->
        <div class="loading-overlay" v-if="fileLoading">
          <div class="text-center">
            <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          </div>
        </div>
      </div>
    </div>
    <Card class="disclaimer-card m-2 py-2 px-3">
      <template #header>
        <h3>⚠ Disclaimer ⚠</h3>
      </template>
      <template #content>
        <ul>
          <li>
            I will not be responsible for any loss of save files or save file
            corruption.
          </li>
          <li>
            Hogwarts Legacy brand and name is the registered trademark of its
            respective owner.
          </li>
          <li>
            hogwarts-legacy-save-editor has no partnership, sponsorship or
            endorsement with Avalanche Software or Warner Bros. Games.
          </li>
        </ul>
      </template>
    </Card>
  </main>
</template>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

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

.content {
  padding: 2rem;
}
</style>

<style lang="scss">
@import 'primevue/resources/themes/saga-blue/theme.css'; //theme
@import 'primevue/resources/primevue.min.css'; //core css
@import 'primeicons/primeicons.css'; //icons
@import 'primeflex/primeflex.scss';

.p-button {
  max-height: 34px;
  font-size: 0.8rem;
  .p-button-label {
    font-size: 0.8rem;
  }
}

.p-dropdown {
  max-height: 34px;

  .pi {
    font-size: 0.875rem;
  }
}

.p-dropdown .p-dropdown-label,
.p-dropdown-panel .p-dropdown-items .p-dropdown-item {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}

.p-dropdown-panel .p-dropdown-items {
  padding: 0.25rem 0;

  .p-dropdown-item:last-of-type {
    padding-bottom: 0;
  }
}

.p-dialog-content {
  code {
    color: salmon;
    background-color: rgb(230, 230, 230);
    display: inline-block;
    padding: 0 4px;
    border-radius: 4px;
  }
  u {
    color: red;
    font-weight: bold;
  }

  .p-fileupload {
    display: inline-block;
  }

  .p-button {
    pointer-events: none;
  }
}

.disclaimer-card.p-card {
  background-color: var(--red-200);

  .p-card-header {
    margin-top: 1rem;
  }
}

@media (prefers-color-scheme: dark) {
  .p-toolbar {
    background-color: var(--vt-c-black-soft);
    border-color: var(--vt-c-divider-dark-2);
  }
}
</style>
