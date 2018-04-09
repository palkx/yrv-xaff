<template>
  <div class="video">
    <youtube ref="youtube" width="100%" height="100%" :player-vars="current.videoSettings" @ready="ready()" @paused="paused()" @playing="playing()" @ended="ended()" />
  </div>
</template>

<script>
export default {
  name: 'YoutubeRV',
  data () {
    return {
      current: {
        video: '',
        videoId: '',
        durationTimer: null,
        player: null,
        currentTime: 0,
        duration: 0,
        videoSettings: {
          start: 0,
          end: null,
          autoplay: 1,
          cc_load_policy: 0,
          color: 'white',
          controls: 0,
          disablekb: 0,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0
        }
      },
      next: {
        video: ''
      },
      init: false,
      nextLoaded: false
    }
  },
  methods: {
    playing () {
      this.durationTimer = setInterval(this.videoTime, 1000)
    },
    paused () {
      clearInterval(this.durationTimer)
    },
    ended () {
      clearInterval(this.durationTimer)
      this.loadVideo()
    },
    ready () {
      this.current.player = this.$refs.youtube.player
      this.init = true
      this.loadVideo()
    },
    async loadVideo () {
      this.current.video = this.next.video
      this.current.videoId = this.current.video.videoId
      this.current.videoSettings.start = this.current.video.start
      this.current.videoSettings.end = this.current.video.end
      this.current.duration = 0
      this.current.player.loadVideoById({
        'videoId': this.current.videoId,
        'startSeconds': this.current.video.start,
        'endSeconds': this.current.video.end
      })
      this.nextLoaded = false
    },
    async preloadVideo () {
      const video = await this.$http.get(this.apiEndpoint + '/yrvs/random')
      this.next.video = video.body
      if (!this.nextLoaded) {
        this.nextLoaded = true
      }
    },
    async videoTime () {
      if (this.current.duration === 0) {
        this.current.duration = this.current.videoSettings.end > 0
          ? this.current.videoSettings.start > 0
            ? this.current.videoSettings.end - this.current.videoSettings.start
            : this.current.videoSettings.end
          : this.current.videoSettings.start > 0
            ? Math.floor(await this.current.player.getDuration()) - this.current.videoSettings.start
            : Math.floor(await this.current.player.getDuration())
      }
      this.current.currentTime = this.current.videoSettings.start > 0
        ? Math.floor(await this.current.player.getCurrentTime() + 1) - this.current.videoSettings.start
        : Math.floor(await this.current.player.getCurrentTime())
      if ((Math.floor((this.current.currentTime / this.current.duration) * 100) > 80) && !this.nextLoaded) {
        this.preloadVideo()
      }
    }
  },
  created () {
    this.preloadVideo()
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
