<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import YoutubeRV from './components/YoutubeRV';

export default {
  name: 'App',
  components: {
    YoutubeRV
  }
};
</script>

<style lang="scss">
* {
  box-sizing: border-box;
  font-family: 'Source Sans Pro','Helvetica Neue',Helvetica,Arial,sans-serif;
  font-weight: 400;
}

html, body, #app {
  width: 100%;
  height: 100%;
  background-color: #2c3e50;
  margin: auto;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
