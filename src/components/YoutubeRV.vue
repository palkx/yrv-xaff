<template>
  <div class="video">
    <youtube ref="youtube" width="100%" height="100%" :player-vars="current.videoSettings" @ready="ready()"  @playing="playing()" @paused="paused()" @buffering="buffering()" @error="error()" @ended="ended()" />
    <div class="controls">
      <button class="btn" @click="loadNext()">Skip >></button>
    </div>
    <div id="progress">
      <div class="progress-bar" id="current" :style="{ width: current.currentTimePercent + '%', 'background-color': current.currentProgressBarBackgroundColor }"></div>
      <div class="progress-bar" id="buffered" :style="{ width: current.bufferedPercent + '%' }"></div>
      <div class="progress-bar" id="background"></div>
    </div>
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
        currentTimePercent: 0,
        bufferedPercent: 0,
        currentProgressBarBackgroundColor: 'white',
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
      nextLoaded: false
    }
  },
  methods: {
    ready () {
      this.current.player = this.$refs.youtube.player
      this.loadVideo()
    },
    playing () {
      if (!this.durationTimer) {
        this.durationTimer = setInterval(this.videoTime, 1000)
      }
      this.current.currentProgressBarBackgroundColor = 'white'
    },
    paused () {
      clearInterval(this.durationTimer)
      this.durationTimer = null
      this.current.currentProgressBarBackgroundColor = 'yellow'
    },
    buffering () {
      this.current.currentProgressBarBackgroundColor = 'yellow'
    },
    async error () {
      console.log('ERROR')
      await this.preloadVideo()
      clearInterval(this.durationTimer)
      this.durationTimer = null
      this.loadVideo()
    },
    ended () {
      clearInterval(this.durationTimer)
      this.durationTimer = null
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
    async loadNext () {
      await this.preloadVideo()
      clearInterval(this.durationTimer)
      this.durationTimer = null
      await this.loadVideo()
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
      this.current.currentTimePercent = (this.current.currentTime / this.current.duration) * 100
      this.current.bufferedPercent = (await this.current.player.getVideoLoadedFraction()) * 100
      if ((Math.floor(this.current.currentTimePercent) > 80) && !this.nextLoaded) {
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
.controls {
  opacity: 0;
  z-index: 100;
  height: 40px;
  width: 180px;
  background-color: white;
  position: fixed;
  border-radius: 4px;
  right: 0px;
  bottom: 6px;
  -webkit-transition: opacity 1s linear 3s;
  transition: opacity 1s linear 3s;
}
.controls .btn {
  align-content: center;
  width: 80%;
  margin: 2.5%;
  height: 80%;
}
.btn {
  color: #ffffff;
  background-color: #2BBD1B;
  border-color: #026921;
  border-radius: 5px;
}
.btn:hover,
.btn:focus,
.btn:active {
  color: #ffffff;
  background-color: #247A3E;
  border-color: #026921;
}
#progress {
  opacity: 0;
  z-index: 100;
  width: 100%;
  position: fixed;
  height: 6px;
  bottom: 0px;
  border-top: 1px solid black;
  background-color: rgba(0,0,0,0);
  -webkit-transition: opacity 1s linear 3s;
  transition: opacity 1s linear 3s;
}
.progress-bar {
  position: fixed;
  height: 100%;
  max-width: 100%;
  -webkit-transition: width 1.1s linear, opacity 2s linear, background-color .5s linear;
  transition: width 1.1s linear, opacity 2s linear, background-color .5s linear;
}
.progress-bar#current {
  background-color: rgb(255,255,255);
  z-index: 103;
}
.progress-bar#buffered {
  background-color: rgba(180,180,180,.6);
  z-index: 102;
}
.progress-bar#background {
  width: 100%;
  background-color: rgba(255,255,255,.3);
  z-index: 101;
}
.video {
  display: flex;
  width: 100%;
  height: 100%;
}
.video:hover #progress, .video:hover .controls {
  opacity: 1;
  -webkit-transition: opacity .3s linear;
  transition: opacity .3s linear;
}
</style>
