<script lang="ts">
import PDialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  components: {
    PDialog,
    FileUpload,
  },
  props: {
    show: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props, ctx) {
    const showHelp = ref(props.show);

    function doNothing() {}

    function hideDialog() {
      ctx.emit('hideDialog');
    }

    watch(
      () => props.show,
      () => {
        showHelp.value = props.show;
      }
    );

    return {
      showHelp,
      doNothing,
      hideDialog,
    };
  },
});
</script>

<template>
  <PDialog
    modal
    header="Help"
    v-model:visible="showHelp"
    dismissable-mask
    position="top"
    :draggable="false"
    @hide="hideDialog"
  >
    <p>
      Start by uploading your save file, by clicking
      <FileUpload
        mode="basic"
        name="saveFile"
        auto
        @uploader="doNothing"
        customUpload
        chooseLabel="Open Save File"
      />
      and navigating to
      <code
        >%LocalAppData%\Local\Hogwarts
        Legacy\Saved\SaveGames\&#60;user_id&#62;</code
      >
      typically named <code>HL-00-00.sav</code>. HL-<u>00</u>-00 means the
      character number. HL-00-<u>00</u>
      means the save slot. Save slots 00 through 09 are manual save slots,
      everything else above that are auto save slots.
    </p>
    <h2>Import/Export</h2>
    <p>
      You can import or export an apperance from the currently loaded save file.
      This is useful for creating your new character with the desired appearance
      within the game, loading that save file, exporting the appearance file,
      and then loading your main save file importing the newly created apperance
      file.
    </p>
  </PDialog>
</template>
