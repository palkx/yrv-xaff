// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';

Vue.config.productionTip = false;

Vue.prototype.apiEndpoint = 'https://api.xaff.ru';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});

/*
  FIXME:
  TODO:
  Hide interface when mouse not moving
  Add like/dislike buttons
  Add report button
  Add user settings (save in localStorage)
    Preferred quality
    Preferred player settings
    Preferred interface settings
*/
