const axios = require('axios');

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const DEEPGRAM_API_URL = 'https://api.deepgram.com/v1';

/**
 * Service for DeepGram transcription
 */
class DeepGramService {
  /**
   * Start a live transcription stream
   */
  static async startTranscription(audioStream, options = {}) {
    try {
      const defaultOptions = {
        model: 'nova-2',
        language: 'en-US',
        punctuate: true,
        diarize: false,
        smart_format: true,
        interim_results: true,
        ...options
      };

      // This would typically be done via WebSocket connection
      // For now, returning configuration
      return {
        apiKey: DEEPGRAM_API_KEY,
        url: `${DEEPGRAM_API_URL}/listen`,
        options: defaultOptions
      };
    } catch (error) {
      console.error('DeepGram transcription error:', error);
      throw new Error('Failed to start transcription');
    }
  }

  /**
   * Process audio file transcription
   */
  static async transcribeAudioFile(audioUrl, options = {}) {
    try {
      const defaultOptions = {
        model: 'nova-2',
        language: 'en-US',
        punctuate: true,
        diarize: false,
        smart_format: true,
        ...options
      };

      const response = await axios.post(
        `${DEEPGRAM_API_URL}/listen`,
        { url: audioUrl },
        {
          headers: {
            'Authorization': `Token ${DEEPGRAM_API_KEY}`,
            'Content-Type': 'application/json'
          },
          params: defaultOptions
        }
      );

      return response.data;
    } catch (error) {
      console.error('DeepGram transcription error:', error.response?.data || error.message);
      throw new Error('Failed to transcribe audio');
    }
  }
}

module.exports = DeepGramService;

