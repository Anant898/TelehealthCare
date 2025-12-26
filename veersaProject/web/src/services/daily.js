import DailyIframe from '@daily-co/daily-js';

/**
 * Daily.co service for video consultations
 */
class DailyService {
  constructor() {
    this.daily = null;
    this.callFrame = null;
  }

  /**
   * Initialize Daily.co call frame
   */
  async initCallFrame(container, url, token) {
    try {
      // Destroy any existing frame first
      if (this.callFrame) {
        try {
          await this.callFrame.destroy();
        } catch (e) {
          console.log('Previous frame cleanup:', e);
        }
        this.callFrame = null;
      }

      this.callFrame = DailyIframe.createFrame(container, {
        showLeaveButton: true,
        iframeStyle: {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          border: '0'
        }
      });

      await this.callFrame.join({ url, token });

      return this.callFrame;
    } catch (error) {
      console.error('Daily.co initialization error:', error);
      throw error;
    }
  }

  /**
   * Leave the call
   */
  async leave() {
    if (this.callFrame) {
      await this.callFrame.leave();
      this.callFrame.destroy();
      this.callFrame = null;
    }
  }

  /**
   * Toggle camera
   */
  async toggleCamera() {
    if (this.callFrame) {
      const isCamOn = await this.callFrame.localVideo();
      await this.callFrame.setLocalVideo(!isCamOn);
      return !isCamOn;
    }
    return false;
  }

  /**
   * Toggle microphone
   */
  async toggleMic() {
    if (this.callFrame) {
      const isMicOn = await this.callFrame.localAudio();
      await this.callFrame.setLocalAudio(!isMicOn);
      return !isMicOn;
    }
    return false;
  }

  /**
   * Get network quality
   */
  async getNetworkQuality() {
    if (this.callFrame) {
      const stats = await this.callFrame.getNetworkStats();
      return stats;
    }
    return null;
  }

  /**
   * Set video quality
   */
  async setVideoQuality(quality) {
    if (this.callFrame) {
      // Quality options: 'low', 'medium', 'high'
      await this.callFrame.setBandwidth({
        kbs: quality === 'low' ? 300 : quality === 'medium' ? 600 : 1200
      });
    }
  }
}

export default new DailyService();

