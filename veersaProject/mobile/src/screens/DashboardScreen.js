import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    // Here you would fetch from API
    // For now, use mock data
    setConsultations([
      {
        id: '1',
        specialty: 'Cardiology',
        status: 'scheduled',
        date: new Date().toISOString(),
      },
    ]);
  };

  const handleCreateConsultation = () => {
    navigation.navigate('Registration');
  };

  const handleJoinConsultation = (consultationId) => {
    navigation.navigate('Payment', {
      consultationId,
      amount: 50,
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => navigation.navigate('Home'),
      },
    ]);
  };

  const renderConsultation = ({ item }) => (
    <View style={styles.consultationCard}>
      <View style={styles.consultationInfo}>
        <Text style={styles.consultationTitle}>{item.specialty}</Text>
        <Text style={styles.consultationStatus}>Status: {item.status}</Text>
        <Text style={styles.consultationDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      {item.status !== 'completed' && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoinConsultation(item.id)}
        >
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Consultations</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateConsultation}
        >
          <Text style={styles.createButtonText}>+ New Consultation</Text>
        </TouchableOpacity>

        <FlatList
          data={consultations}
          renderItem={renderConsultation}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No consultations yet</Text>
              <Text style={styles.emptySubtext}>Create one to get started!</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F7FA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
  },
  logoutText: {
    fontSize: 16,
    color: '#DC3545',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  createButton: {
    backgroundColor: '#0066CC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  consultationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultationInfo: {
    flex: 1,
  },
  consultationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  consultationStatus: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 4,
  },
  consultationDate: {
    fontSize: 14,
    color: '#34495E',
  },
  joinButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#34495E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#34495E',
    opacity: 0.7,
  },
});

export default DashboardScreen;

