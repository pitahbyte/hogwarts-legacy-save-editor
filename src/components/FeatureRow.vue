<script lang="ts">
import InputText from 'primevue/inputtext';

import { defineComponent, ref } from 'vue';

export default defineComponent({
  components: {
    InputText,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    feature: {
      type: String,
      required: true,
    },
  },
  setup(props, ctx) {
    const value = ref(props.feature);

    function handleChange() {
      ctx.emit('value-changed', { key: props.name, value: value.value });
    }

    return {
      value,
      handleChange,
    };
  },
});
</script>

<template>
  <div class="features grid p-fluid">
    <div class="col-12 md:col-4">
      <div class="p-inputgroup">
        <span class="p-inputgroup-addon">
          <i class="pi pi-book"></i>
        </span>
        <InputText :value="name" disabled />
      </div>
    </div>
    <div class="col-12 md:col-4">
      <div class="p-inputgroup">
        <span class="p-inputgroup-addon">
          <i class="pi pi-pencil"></i>
        </span>
        <InputText v-model="value" @change="handleChange" />
      </div>
    </div>
    <div class="col-12 md:col-4"></div>
  </div>
</template>

<style lang="scss"></style>
