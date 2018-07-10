/*
 * Created on Tue Jul 10 2018
 * Copyright © 2017-2018 Mikhail K. (iSm1le)
 * Licensed under the Apache License, Version 2.0
 */
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
  Add true random videos from youtube with searching by tag or querry, and category selection (ETA 0.7.0)
*/
