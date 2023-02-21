<script setup lang="ts">
import Dropdown from 'primevue/dropdown';
import FeatureRow, { type Feature } from '@/components/FeatureRow.vue';
import type HogwartsDB from '@/lib/HogwartsDB';
import type { PropType } from 'vue';
import { ref } from 'vue';

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

const features = ref<Feature[]>([]);

function loadingWrapper(callback: (...args: any[]) => void) {
  if (!props.hogwartsDB) {
    return;
  }

  emit('loading', true);
  setTimeout(() => {
    callback();
    emit('loading', false);
  }, 500);
}

function updateAppearance() {
  loadingWrapper(() => {
    features.value = props.hogwartsDB!.getAppearance();
  });
}

function updateGender() {
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
    updateGender();
  }
}

function refresh() {
  updateGender();
  updateAppearance();
}

defineExpose({
  refresh,
});
</script>

<template>
  <div class="grid">
    <div class="card col">
      <div class="features-container">
        <h2>Features</h2>
        <span v-if="!features.length"><i>No features to show</i></span>
        <FeatureRow
          v-for="feature in features"
          :key="feature.name"
          :feature="feature"
        ></FeatureRow>

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
  </div>
</template>
