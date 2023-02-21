import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';

import './assets/main.css';

const app = createApp(App);

app.use(PrimeVue);
app.directive('tooltip', Tooltip);

app.mount('#app');
