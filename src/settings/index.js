/*
 * Created on Tue Jul 10 2018
 * Copyright © 2017-2018 Mikhail K. (iSm1le)
 * Licensed under the Apache License, Version 2.0
 */
export default {
  settings: {
    volume: 50
  },


  /**
   * @param {number} volume Volume that saved in user localStorage
   * @returns {void}
   */
  setVolume(volume) {
    console.log(`Updating volume to ${volume}`);
    this.settings.volume = volume;
    this.updateSettings(this.settings);
  },

  /**
   * @returns {number} User player volume
   */
  getVolume() {
    this.loadSettings();
    return this.settings.volume;
  },

  /**
   * @returns {array} User settings
   */
  getSettings() {
    this.loadSettings();
    return this.settings;
  },

  /**
   * @param {array} settings Stores user settings in localStorage
   */
  updateSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
  },

  /**
   * Loads settings from localStorage
   */
  loadSettings() {
    if (localStorage.getItem('settings')) {
      const settings = JSON.parse(localStorage.getItem('settings'));
      this.settings = settings;
    }
  }
};
