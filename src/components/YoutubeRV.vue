<template>
  <div class="video">
    <youtube :video-id="videoID" width="100%" height="100%" :player-vars="playerVars" ref="youtube" @playing="playing()" @ended="ended()" />
  </div>
</template>

<script>
export default {
  name: 'YoutubeRV',
  data () {
    return {
      video: null,
      videoID: null,
      playerVars: {
        autoplay: 1,
        cc_load_policy: 0,
        color: 'white',
        controls: 0,
        disablekb: 0,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        start: 0,
        end: null
      }
    }
  },
  computed: {
    player () {
      return this.$refs.youtube.player
    }
  },
  methods: {
    playing () {
      return true
    },
    ended () {
      this.loadVideo()
    },
    loadVideo () {
      this.$http.get(this.apiEndpoint + '/yrvs/random').then((data, err) => {
        if (!err) {
          this.video = data.body
          this.videoID = this.video.videoId
          this.playerVars.start = this.video.start
          this.playerVars.end = this.video.end
        }
      })
    }
  },
  created () {
    this.loadVideo()
  }
}
</script>

<style scoped>
.video {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
