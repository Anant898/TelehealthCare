const axios = require('axios');

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = process.env.DAILY_API_URL || 'https://api.daily.co/v1';

/**
 * Service for Daily.co video room management
 */
class DailyService {
  /**
   * Create a new video room for consultation
   */
  static async createRoom(config = {}) {
    try {
      if (!DAILY_API_KEY) {
        throw new Error('DAILY_API_KEY is not configured. Please set it in your environment variables.');
      }

      const defaultConfig = {
        properties: {
          max_participants: 2,
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: false,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
          enable_knocking: false,
          enable_prejoin_ui: true,
          start_video_off: false,
          start_audio_off: false,
          ...config.properties
        }
      };

      const response = await axios.post(
        `${DAILY_API_URL}/rooms`,
        defaultConfig,
        {
          headers: {
            'Authorization': `Bearer ${DAILY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data || !response.data.name || !response.data.url) {
        throw new Error('Invalid response from Daily.co API: missing room name or URL');
      }

      return response.data;
    } catch (error) {
      console.error('Daily.co create room error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config?.url
      });
      
      if (error.response?.status === 401) {
        throw new Error('Daily.co API authentication failed. Please check your DAILY_API_KEY.');
      } else if (error.response?.status === 403) {
        throw new Error('Daily.co API access forbidden. Please check your API key permissions.');
      } else if (error.response?.data) {
        throw new Error(`Daily.co API error: ${JSON.stringify(error.response.data)}`);
      }
      
      throw new Error(`Failed to create Daily.co room: ${error.message}`);
    }
  }

  /**
   * Generate token for room access
   */
  static async createToken(roomName, userId, config = {}) {
    try {
      if (!DAILY_API_KEY) {
        throw new Error('DAILY_API_KEY is not configured. Please set it in your environment variables.');
      }

      if (!roomName) {
        throw new Error('Room name is required to create a token');
      }

      const tokenConfig = {
        properties: {
          room_name: roomName,
          user_id: userId,
          is_owner: config.isOwner || false,
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2), // 2 hours
          ...config.properties
        }
      };

      const response = await axios.post(
        `${DAILY_API_URL}/meeting-tokens`,
        tokenConfig,
        {
          headers: {
            'Authorization': `Bearer ${DAILY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data || !response.data.token) {
        throw new Error('Invalid response from Daily.co API: missing token');
      }

      return response.data.token;
    } catch (error) {
      console.error('Daily.co create token error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        throw new Error('Daily.co API authentication failed. Please check your DAILY_API_KEY.');
      } else if (error.response?.data) {
        throw new Error(`Daily.co API error: ${JSON.stringify(error.response.data)}`);
      }
      
      throw new Error(`Failed to create Daily.co token: ${error.message}`);
    }
  }

  /**
   * Delete a room
   */
  static async deleteRoom(roomName) {
    try {
      await axios.delete(
        `${DAILY_API_URL}/rooms/${roomName}`,
        {
          headers: {
            'Authorization': `Bearer ${DAILY_API_KEY}`
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Daily.co delete room error:', error.response?.data || error.message);
      throw new Error('Failed to delete Daily.co room');
    }
  }

  /**
   * Get room information
   */
  static async getRoom(roomName) {
    try {
      const response = await axios.get(
        `${DAILY_API_URL}/rooms/${roomName}`,
        {
          headers: {
            'Authorization': `Bearer ${DAILY_API_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Daily.co get room error:', error.response?.data || error.message);
      throw new Error('Failed to get Daily.co room');
    }
  }
}

module.exports = DailyService;

