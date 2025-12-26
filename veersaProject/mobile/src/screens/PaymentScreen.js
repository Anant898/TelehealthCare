import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { consultationId, amount } = route.params || { amount: 50 };
  const [loading, setLoading] = useState(false);
  const [testMode] = useState(__DEV__ || process.env.TEST === 'true'); // React Native __DEV__ for development

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // In TEST mode, we can skip actual Square SDK integration
      if (testMode) {
        console.log('🧪 TEST MODE: Payment will be processed as successful (mock)');
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        Alert.alert('Success', '🧪 TEST MODE: Payment completed successfully (mock)', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Consultation', { consultationId }),
          },
        ]);
      } else {
        // Here you would integrate with Square payment SDK
        // For now, simulate payment
        setTimeout(() => {
          setLoading(false);
          Alert.alert('Success', 'Payment completed successfully', [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Consultation', { consultationId }),
            },
          ]);
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Complete Payment</Text>
        <Text style={styles.amount}>${amount.toFixed(2)}</Text>

        {testMode && (
          <View style={styles.testModeBanner}>
            <Text style={styles.testModeText}>
              🧪 TEST MODE: Payment will be processed as successful (no actual charge)
            </Text>
          </View>
        )}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Payment processing powered by Square</Text>
          <Text style={styles.noteText}>
            Please complete payment to start your consultation
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.payButton]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.payButtonText}>Pay ${amount.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0066CC',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#F5F7FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#34495E',
    fontStyle: 'italic',
  },
  testModeBanner: {
    backgroundColor: '#ffc107',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ffca2c',
  },
  testModeText: {
    color: '#856404',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F7FA',
  },
  cancelButtonText: {
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#0066CC',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;

