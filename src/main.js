// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueYoutube from 'vue-youtube'
import Resource from 'vue-resource'

Vue.use(VueYoutube)
Vue.use(Resource)

Vue.config.productionTip = false

Vue.prototype.apiEndpoint = 'https://api.xaff.ru'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})

/*
  FIXME:
  TODO:
  Add skip button
  Add progressbar
  Add like/dislike buttons
  Add report button
  Handle youtube error state
  Add get parameters to applications
    Video id
  Add user settings (save in localStorage)
    Preferred quality
    Preferred player settings
    Preferred interface settings
*/
