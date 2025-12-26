import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SPECIALTIES = [
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'General Medicine',
  'Orthopedics',
  'Neurology',
];

const RegistrationScreen = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    medicalHistory: '',
    password: '',
    confirmPassword: '',
  });

  const handleSpecialtySelect = (specialty) => {
    setSelectedSpecialty(specialty);
    setStep(2);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Here you would call the API to register
    // For now, navigate to dashboard
    navigation.navigate('Dashboard');
  };

  if (step === 1) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Specialty</Text>
          <Text style={styles.subtitle}>Choose the type of consultation you need</Text>
        </View>

        <View style={styles.specialtyGrid}>
          {SPECIALTIES.map((specialty) => (
            <TouchableOpacity
              key={specialty}
              style={styles.specialtyCard}
              onPress={() => handleSpecialtySelect(specialty)}
            >
              <Text style={styles.specialtyText}>{specialty}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patient Registration</Text>
        <Text style={styles.specialtyBadge}>Specialty: {selectedSpecialty}</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number *"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Date of Birth (YYYY-MM-DD) *"
          value={formData.dateOfBirth}
          onChangeText={(value) => handleInputChange('dateOfBirth', value)}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Medical History (Optional)"
          multiline
          numberOfLines={4}
          value={formData.medicalHistory}
          onChangeText={(value) => handleInputChange('medicalHistory', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Password *"
          secureTextEntry
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password *"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Register and Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#34495E',
  },
  specialtyBadge: {
    backgroundColor: '#0066CC',
    color: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  specialtyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  specialtyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F5F7FA',
    minWidth: '45%',
    alignItems: 'center',
  },
  specialtyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
  },
  form: {
    padding: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#2C3E50',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0066CC',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RegistrationScreen;

