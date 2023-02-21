<script lang="ts">
import InputText from 'primevue/inputtext';
import type { Feature } from '@/lib/HogwartsDB';

import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  components: {
    InputText,
  },
  props: {
    feature: {
      type: Object as PropType<Feature>,
      required: true,
    },
  },
  setup() {},
});
</script>

<template>
  <div class="features grid p-fluid">
    <div class="col-12 md:col-4">
      <div class="p-inputgroup">
        <span class="p-inputgroup-addon">
          <i class="pi pi-book"></i>
        </span>
        <InputText :value="feature.name" disabled />
      </div>
    </div>
    <div class="col-12 md:col-4">
      <div class="p-inputgroup">
        <span class="p-inputgroup-addon">
          <i class="pi pi-pencil"></i>
        </span>
        <InputText :value="feature.value" />
      </div>
    </div>
    <div class="col-12 md:col-4"></div>
  </div>
</template>

<style lang="scss"></style>
