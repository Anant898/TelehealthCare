const axios = require('axios');

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_APPLICATION_ID = process.env.SQUARE_APPLICATION_ID;
const SQUARE_ENVIRONMENT = process.env.SQUARE_ENVIRONMENT || 'sandbox';
const SQUARE_API_URL = SQUARE_ENVIRONMENT === 'production' 
  ? 'https://connect.squareup.com/v2'
  : 'https://connect.squareupsandbox.com/v2';

/**
 * Service for Square payment processing
 */
class SquareService {
  /**
   * Create a payment
   */
  static async createPayment(amount, sourceId, idempotencyKey, referenceId) {
    // Check if Square is configured
    if (!SQUARE_ACCESS_TOKEN || !SQUARE_APPLICATION_ID) {
      throw new Error('Square payment is not configured. Please set SQUARE_ACCESS_TOKEN and SQUARE_APPLICATION_ID in your environment variables.');
    }

    try {
      const paymentRequest = {
        idempotency_key: idempotencyKey,
        source_id: sourceId,
        amount_money: {
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'USD'
        },
        reference_id: referenceId,
        note: `Telehealth consultation payment - ${referenceId}`
      };

      console.log('Processing Square payment:', {
        amount: paymentRequest.amount_money,
        environment: SQUARE_ENVIRONMENT
      });

      const response = await axios.post(
        `${SQUARE_API_URL}/payments`,
        paymentRequest,
        {
          headers: {
            'Square-Version': '2023-10-18',
            'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Payment successful:', response.data.payment.id);
      return response.data.payment;
    } catch (error) {
      console.error('Square payment error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.errors?.[0]?.detail || 'Failed to process payment';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get payment details
   */
  static async getPayment(paymentId) {
    if (!SQUARE_ACCESS_TOKEN) {
      throw new Error('Square is not configured');
    }

    try {
      const response = await axios.get(
        `${SQUARE_API_URL}/payments/${paymentId}`,
        {
          headers: {
            'Square-Version': '2023-10-18',
            'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`
          }
        }
      );

      return response.data.payment;
    } catch (error) {
      console.error('Square get payment error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.errors?.[0]?.detail || 'Failed to get payment details';
      throw new Error(errorMessage);
    }
  }

  /**
   * Create a card nonce (for web/mobile integration)
   */
  static async createCardNonce(cardData) {
    // This would typically be done client-side with Square's SDK
    // This is a placeholder for server-side card processing if needed
    return cardData;
  }
}

module.exports = SquareService;

