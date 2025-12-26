import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './Payment.css';

const Payment = ({ consultationId, amount, onComplete, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [cardReady, setCardReady] = useState(false);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');
  const [skipPayment, setSkipPayment] = useState(false);
  const cardRef = useRef(null);
  const paymentsRef = useRef(null);
  const cardInstanceRef = useRef(null);
  const initializingRef = useRef(false);

  // Fetch config on mount
  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize Square after config is loaded and component is rendered
  useEffect(() => {
    if (config?.configured && !skipPayment && !cardReady && cardRef.current && !initializingRef.current) {
      initializeSquare(config);
    }
  }, [config, skipPayment, cardReady]);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/payments/config');
      setConfig(response.data);
      
      // Skip payment if in test mode or not configured
      if (response.data.testMode || !response.data.configured) {
        setSkipPayment(true);
      }
      
      setInitializing(false);
    } catch (error) {
      console.error('Error fetching payment config:', error);
      setError('Failed to load payment configuration');
      setSkipPayment(true);
      setInitializing(false);
    }
  };

  const initializeSquare = async (configData) => {
    // Prevent double initialization
    if (cardInstanceRef.current || initializingRef.current) return;
    initializingRef.current = true;
    
    try {
      // Load Square Web Payments SDK
      if (!window.Square) {
        const script = document.createElement('script');
        script.src = configData.squareEnvironment === 'production' 
          ? 'https://web.squarecdn.com/v1/square.js'
          : 'https://sandbox.web.squarecdn.com/v1/square.js';
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Square SDK'));
        });
      }

      if (!window.Square) {
        throw new Error('Square.js failed to load');
      }

      // Initialize Square Payments
      const payments = window.Square.payments(
        configData.squareApplicationId,
        configData.squareEnvironment === 'production' ? 'production' : 'sandbox'
      );
      paymentsRef.current = payments;

      // Initialize Card payment method
      if (cardRef.current && !cardInstanceRef.current) {
        const card = await payments.card();
        await card.attach(cardRef.current);
        cardInstanceRef.current = card;
        setCardReady(true);
        setError('');
        console.log('✅ Square payment form initialized successfully');
      }

    } catch (error) {
      console.error('Error initializing Square:', error);
      setError('Failed to initialize payment form. Please refresh the page and try again.');
      initializingRef.current = false;
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!config.configured) {
        throw new Error('Payment system is not configured. Please contact support.');
      }

      if (!cardInstanceRef.current) {
        throw new Error('Payment form not initialized. Please refresh the page.');
      }

      // Tokenize the card
      const result = await cardInstanceRef.current.tokenize();
      if (result.status !== 'OK') {
        let errorMessage = 'Card tokenization failed';
        if (result.errors && result.errors.length > 0) {
          errorMessage = result.errors[0].message;
        }
        throw new Error(errorMessage);
      }

      const sourceId = result.token;

      // Process payment on backend
      await api.post(`/payments/consultation/${consultationId}`, {
        sourceId: sourceId,
        amount: amount
      });

      console.log('✅ Payment processed successfully');
      onComplete();
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.error 
        || error.message 
        || 'Payment failed. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="payment-container">
        <div className="payment-modal">
          <div className="payment-loading">
            <div className="spinner"></div>
            <p>Loading payment form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-modal">
        <h2>Complete Payment</h2>
        <p className="payment-amount">Amount: ${amount.toFixed(2)}</p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handlePayment} className="payment-form">
          {skipPayment ? (
            <div className="alert alert-info">
              ✅ <strong>Payment Skipped</strong>
              <p>Payment is not required for this consultation (Test Mode or payment system unavailable).</p>
              <p style={{ fontSize: '12px', marginTop: '10px' }}>Click "Continue" to proceed to the consultation.</p>
            </div>
          ) : config?.configured ? (
            <>
              <div className="payment-info">
                <p className="secure-badge">🔒 Secure payment powered by Square</p>
                <p className="note">Enter your card details below</p>
              </div>
              <div className="card-container">
                <label>Card Details</label>
                <div ref={cardRef} id="card-container"></div>
              </div>
            </>
          ) : (
            <div className="alert alert-warning">
              ⚠️ <strong>Payment system not configured</strong>
              <p>Square payment credentials are missing. Please contact the administrator.</p>
              <p style={{ fontSize: '12px', marginTop: '10px' }}>Required: SQUARE_APPLICATION_ID and SQUARE_ACCESS_TOKEN</p>
            </div>
          )}

          <div className="payment-actions">
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            {skipPayment ? (
              <button
                type="button"
                onClick={onComplete}
                className="pay-button"
              >
                Continue to Consultation
              </button>
            ) : (
              <button
                type="submit"
                className="pay-button"
                disabled={loading || !config?.configured}
              >
                {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payment;
