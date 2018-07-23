<!--
  // Created on Tue Jul 10 2018
  // Copyright © 2017-2018 Mikhail K. (iSm1le)
  // Licensed under the Apache License, Version 2.0
  -->
<template>
  <div class="page-container md-layout-column">
    <md-toolbar :class="{'md-dense': true, 'md-primary': true, 'shoving-settings': showSettings}">
      <md-button
        class="md-icon-button"
        @click="showSettings = true">
        <md-icon>menu</md-icon>
      </md-button>
      <span class="md-title">XaFF RV</span>
      <span
        v-if="nextLoaded"
        :title="`Next: ${ next.video.friendlyName } `"
        class="md-title video-title">{{ `Next: ${ next.video.friendlyName }` }}</span>
      <span
        v-if="nextLoaded"
        class="md-title video-time">{{ `in ${current.duration - current.currentTime}s` }}</span>
      <div class="md-toolbar-section-end">
        <md-button
          :disabled="current.loadingNext"
          class="md-icon-button"
          @click="loadNext()">
          <md-icon>refresh</md-icon>
        </md-button>
      </div>
      <md-progress-bar
        :md-value="current.currentTimePercent"
        :md-buffer="current.bufferedPercent"
        :class="`${ isMouseHovered ? 'md-primary' : 'md-accent' }`"
        md-mode="buffer"/>
    </md-toolbar>
    <md-drawer :md-active.sync="showSettings">
      <md-list>
        <md-list-item>
          <span class="md-title">Settings</span>
        </md-list-item>
        <md-list-item>
          <md-icon
            v-if="userSettings.volume === 0"
            class="volume">volume_mute</md-icon>
          <md-icon
            v-else-if="userSettings.volume <= 75"
            class="volume">volume_down</md-icon>
          <md-icon
            v-else-if="userSettings.volume >= 76"
            class="volume">volume_up</md-icon>
          <input
            v-model.number="userSettings.volume"
            type="range"
            @change="updateVolume(userSettings.volume)"> {{ userSettings.volume }}%
        </md-list-item>
        <md-list-item>
          <a
            style="text-decoration: none; color: black;"
            href="https://github.com/iSm1le"
            target="_blank">Developer</a>
          <div><span style="font-weight: 700;">Version:</span> {{ appVer }}</div>
        </md-list-item>
      </md-list>
    </md-drawer>
    <md-content
      @mouseover="isMouseHovered = true"
      @mouseout="isMouseHovered = false">
      <youtube
        ref="youtube"
        :player-vars="current.videoSettings"
        style="position: absolute;
              top: 0;
              min-height: 100%;
              min-width: 100%;
              flex: 1;
              display: flex;
              justify-content: center;
              flex-direction: column;"
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
import settings from '../settings';
import { version } from '../../package.json';

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
      userSettings: {},
      customVideo: false,
      nextLoaded: false,
      showSettings: false,
      isMouseHovered: false // True if mouse is over "content"
    };
  },
  computed: {
    id() {
      return this.$route.params.id;
    },
    appVer() {
      return version;
    }
  },
  created() {
    this.userSettings = settings.getSettings();
    if (String(this.id).length === 11) {
      this.customVideo = true;
    } else {
      this.preloadVideo();
    }
  },
  methods: {
    async ready() {
      this.current.player = this.$refs.youtube.player;
      await this.loadVideo();
      if (this.userSettings.volume >= 0) {
        this.current.player.setVolume(this.userSettings.volume);
      }
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
        this.current.videoSettings.start = this.$route.query.start ? Number(this.$route.query.start) : 0;
        this.current.videoSettings.end = this.$route.query.end ? Number(this.$route.query.end) : 0;
        this.current.video.start = this.current.videoSettings.start;
        this.current.video.end = this.current.videoSettings.end;
        this.current.duration = 0;
        document.title = `XaFF RV | ${this.current.videoId}`;
      } else {
        this.current.video = this.next.video;
        this.current.videoId = this.current.video.videoId;
        this.current.videoSettings.start = this.current.video.start;
        this.current.videoSettings.end = this.current.video.end;
        this.current.duration = 0;
        document.title = `XaFF RV | ${this.current.video.friendlyName}`;
      }
      await this.current.player.loadVideoById({
        videoId: this.current.videoId,
        startSeconds: this.current.video.start,
        endSeconds: this.current.video.end
      });
      this.$router.replace(`/${this.current.videoId}?start=${this.current.video.start}&end=${this.current.video.end}`);
      this.current.viewed = false;
      this.nextLoaded = false;
    },
    async preloadVideo() {
      const video = await this.$http.get(`${this.apiEndpoint}/yrvs/random`);
      this.next.video = video.body;
      this.nextLoaded = true;
    },
    async videoViewed(id) {
      await this.$http.get(`${this.apiEndpoint}/yrvs/vid/${id}/viewed`);
      this.current.viewed = true;
    },
    async loadNext() {
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
      if ((Math.floor(this.current.currentTimePercent) > 80) && !this.current.viewed) {
        this.videoViewed(this.current.videoId);
      }
    },
    updateVolume(vol) {
      settings.setVolume(vol);
      this.current.player.setVolume(vol);
    }
  }
};
</script>

<style lang="scss" scoped>
.page-container:hover .md-toolbar {
  transform: translateY(-100%);
}

.page-container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  justify-content: center;

  .md-toolbar {
    transform: translateY(0%);

    &:hover, &.shoving-settings {
      transform: translateY(0%);
    }

    .md-title {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .video-title {
      max-width: 39%;
    }

    .video-time {
      margin-left: 5px;
    }

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

    .md-list-item .md-icon.volume {
      margin-right: 16px;
    }
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
