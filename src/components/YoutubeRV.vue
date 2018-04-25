<template>
  <div class="page-container md-layout-column">
    <md-toolbar class="md-dense md-primary">
      <md-button
        class="md-icon-button"
        @click="showNavigation = true">
        <md-icon>menu</md-icon>
      </md-button>
      <span class="md-title">Youtube RV</span>
      <span
        v-if="nextLoaded"
        class="md-title">{{ `Next: ${ next.video.friendlyName } in ${current.duration - current.currentTime}s` }}</span>
      <div class="md-toolbar-section-end">
        <md-button
          class="md-icon-button"
          @click="loadNext()"
          :disabled="current.loadingNext">
          <md-icon>refresh</md-icon>
        </md-button>
      </div>
      <md-progress-bar
        class="md-accent"
        md-mode="buffer"
        :md-value="current.currentTimePercent"
        :md-buffer="current.bufferedPercent"/>
    </md-toolbar>
    <md-drawer
      class=""
      :md-active.sync="showNavigation">
      <md-toolbar
        class="md-transparent"
        md-elevation="0">
        <span class="md-title">Settings</span>
      </md-toolbar>
      <!--<md-list>
        <md-list-item>
          <md-icon>move_to_inbox</md-icon>
          <span class="md-list-item-text">Inbox</span>
        </md-list-item>
        <md-list-item>
          <md-icon>send</md-icon>
          <span class="md-list-item-text">Sent Mail</span>
        </md-list-item>
        <md-list-item>
          <md-icon>delete</md-icon>
          <span class="md-list-item-text">Trash</span>
        </md-list-item>
        <md-list-item>
          <md-icon>error</md-icon>
          <span class="md-list-item-text">Spam</span>
        </md-list-item>
      </md-list>-->
    </md-drawer>
    <md-content>
      <youtube
        style="
          position: absolute;
          top: 0;
          min-height: 100%;
          min-width: 100%;
          flex: 1;
          display: flex;
          justify-content: center;
          flex-direction: column;
          "
        ref="youtube"
        :player-vars="current.videoSettings"
        @ready="ready()"
        @playing="playing()"
        @paused="paused()"
        @buffering="buffering()"
        @error="error()"
        @ended="ended()" />
    </md-content>
  </div>
</template>

<script>
export default {
  name: 'YoutubeRV',
  data() {
    return {
      current: {
        video: {},
        videoId: '',
        durationTimer: null,
        player: null,
        currentTime: 0,
        currentTimePercent: 0,
        bufferedPercent: 0,
        duration: 0,
        loadingNext: false,
        viewed: false,
        videoSettings: {
          start: 0,
          end: null,
          autoplay: 1,
          cc_load_policy: 0, // eslint-disable-line camelcase
          color: 'white',
          controls: 0,
          disablekb: 0,
          fs: 0,
          iv_load_policy: 3, // eslint-disable-line camelcase
          modestbranding: 1,
          rel: 0,
          showinfo: 0
        }
      },
      next: {
        video: ''
      },
      customVideo: false,
      nextLoaded: false,
      showNavigation: false
    };
  },
  computed: {
    id() {
      return this.$route.params.id;
    }
  },
  methods: {
    async ready() {
      this.current.player = this.$refs.youtube.player;
      await this.loadVideo();
    },
    playing() {
      if (!this.durationTimer) {
        this.durationTimer = setInterval(this.videoTime, 1000);
      }
    },
    paused() {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    },
    buffering() {
      return true;
    },
    async error() {
      if (this.customVideo) {
        this.customVideo = false;
        this.$router.push('/');
      }
      await this.loadNext();
    },
    async ended() {
      if (this.customVideo) {
        this.customVideo = false;
        this.$router.push('/');
      }
      clearInterval(this.durationTimer);
      this.durationTimer = null;
      await this.loadVideo();
    },
    async loadVideo() {
      if (this.customVideo) {
        this.current.videoId = this.id;
        console.log(this.$route.query.start);
        this.current.videoSettings.start = this.$route.query.start ? Number(this.$route.query.start) : 0;
        this.current.videoSettings.end = this.$route.query.end ? Number(this.$route.query.end) : 0;
        this.current.video.start = this.current.videoSettings.start;
        this.current.video.end = this.current.videoSettings.end;
        this.current.duration = 0;
        console.log(this.current.videoSettings);
      } else {
        this.current.video = this.next.video;
        this.current.videoId = this.current.video.videoId;
        this.current.videoSettings.start = this.current.video.start;
        this.current.videoSettings.end = this.current.video.end;
        this.current.duration = 0;
      }
      await this.current.player.loadVideoById({
        videoId: this.current.videoId,
        startSeconds: this.current.video.start,
        endSeconds: this.current.video.end
      });
      this.nextLoaded = false;
    },
    async preloadVideo() {
      const video = await this.$http.get(`${this.apiEndpoint}/yrvs/random`);
      this.next.video = video.body;
      this.nextLoaded = true;
    },
    async videoViewed(_id) {
      await this.$http.get(`${this.apiEndpoint}/yrvs/id/${_id}/viewed`);
      this.current.viewed = true;
    },
    async loadNext() {
      if (this.customVideo) {
        this.customVideo = false;
        this.$router.push('/');
      }
      this.current.loadingNext = true;
      if (!this.nextLoaded) {
        await this.preloadVideo();
      }
      clearInterval(this.durationTimer);
      this.durationTimer = null;
      await this.loadVideo();
      this.current.loadingNext = false;
    },
    async videoTime() {
      if (this.current.duration === 0) {
        this.current.duration = this.current.videoSettings.end > 0
          ? this.current.videoSettings.start > 0
            ? this.current.videoSettings.end - this.current.videoSettings.start
            : this.current.videoSettings.end
          : this.current.videoSettings.start > 0
            ? Math.floor(await this.current.player.getDuration()) - this.current.videoSettings.start
            : Math.floor(await this.current.player.getDuration());
      }
      this.current.currentTime = this.current.videoSettings.start > 0
        ? Math.floor(await this.current.player.getCurrentTime() + 1) - this.current.videoSettings.start
        : Math.floor(await this.current.player.getCurrentTime());
      this.current.currentTimePercent = (this.current.currentTime / this.current.duration) * 100;
      this.current.bufferedPercent = await this.current.player.getVideoLoadedFraction() * 100;
      if ((Math.floor(this.current.currentTimePercent) > 1) && !this.nextLoaded) {
        this.preloadVideo();
      }
      if ((Math.floor(this.current.currentTimePercent) > 80) && !this.current.viewed && !this.customVideo) {
        this.videoViewed(this.current.video._id);
      }
    }
  },
  created() {
    if (String(this.id).length === 11) {
      this.customVideo = true;
    } else {
      this.preloadVideo();
    }
  }
};
</script>

<style lang="scss" scoped>
.page-container:hover .md-toolbar {
  transform: translateY(0%);
}

.page-container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  justify-content: center;
  .md-toolbar {
    transform: translateY(-100%);

    .md-progress-bar {
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
    }
  }
  .md-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
  }
  .md-content {
    flex: 1;
    display: flex;
    justify-content: center;
    flex-direction: column;
    overflow: hidden;
    background-color: steelblue;
  }
}
</style>
