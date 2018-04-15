import Vue from 'vue'
import Router from 'vue-router'
import Resource from 'vue-resource'
import VueYoutube from 'vue-youtube'

import YoutubeRV from '@/components/YoutubeRV'

Vue.use(Router)
Vue.use(VueYoutube)
Vue.use(Resource)

export default new Router({
  mode: 'history',
  linkActiveClass: 'open',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    { path: '/', name: 'YoutubeRV', component: YoutubeRV }
  ]
})
