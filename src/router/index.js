import Vue from 'vue';
import Router from 'vue-router';
import Resource from 'vue-resource';
import VueYoutube from 'vue-youtube';
import VueMaterial from 'vue-material'; // Material interface
import 'vue-material/dist/vue-material.min.css'; // Material css
import 'vue-material/dist/theme/default.css'; // Default material theme

import YoutubeRV from '@/components/YoutubeRV';

Vue.use(Router);
Vue.use(VueYoutube);
Vue.use(Resource);
Vue.use(VueMaterial);

export default new Router({
  mode: 'history',
  linkActiveClass: 'open',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    { path: '/', name: 'YoutubeRV without video', component: YoutubeRV },
    { path: '/:id', name: 'YoutubeRV with own video', component: YoutubeRV },
    { path: '*', redirect: '/' }
  ]
});
