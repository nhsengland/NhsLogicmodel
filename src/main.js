import '@babel/polyfill';
import Vue from 'vue';
import App from './App.vue';
import store from './store';
import VueClipboard from 'vue-clipboard2';
import VueCkeditor from 'vue-ckeditor2';
import CompactColorPicker from 'vue-color/src/components/Compact.vue';

Vue.config.productionTip = false;
Vue.use(VueClipboard);
Vue.component('vue-ckeditor', VueCkeditor);
Vue.component('compact-picker', CompactColorPicker);
Vue.component('v-style', {
  render: function(createElement) {
    return createElement('style', this.$slots.default)
  }
});

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');
