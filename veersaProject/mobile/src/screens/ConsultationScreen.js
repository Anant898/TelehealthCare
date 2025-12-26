import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Camera from 'expo-camera';
import VideoCall from '../components/VideoCall';

const { width, height } = Dimensions.get('window');

const ConsultationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { consultationId } = route.params || {};
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [networkQuality, setNetworkQuality] = useState('good');

  // Request camera and microphone permissions
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();
      
      if (cameraStatus !== 'granted' || audioStatus !== 'granted') {
        alert('Camera and microphone permissions are required for video consultation');
      }
    })();
  }, []);

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const handleToggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const handleLeave = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        <VideoCall
          roomUrl="https://example.daily.co/room"
          token="mock-token"
          isVideoOn={isVideoOn}
          isMicOn={isMicOn}
        />
      </View>

      <View style={styles.controls}>
        <View style={styles.networkIndicator}>
          <View style={[styles.statusDot, styles[`status${networkQuality}`]]} />
          <Text style={styles.networkText}>Connection: {networkQuality}</Text>
        </View>

        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[styles.controlButton, !isMicOn && styles.controlButtonInactive]}
            onPress={handleToggleMic}
          >
            <Text style={styles.controlButtonText}>{isMicOn ? '🎤' : '🔇'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, !isVideoOn && styles.controlButtonInactive]}
            onPress={handleToggleVideo}
          >
            <Text style={styles.controlButtonText}>{isVideoOn ? '📹' : '📷'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.leaveButton]}
            onPress={handleLeave}
          >
            <Text style={styles.leaveButtonText}>Leave</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  networkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusgood: {
    backgroundColor: '#28A745',
  },
  statuspoor: {
    backgroundColor: '#DC3545',
  },
  networkText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonInactive: {
    backgroundColor: '#DC3545',
    opacity: 0.8,
  },
  controlButtonText: {
    fontSize: 24,
  },
  leaveButton: {
    backgroundColor: '#DC3545',
    width: 80,
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ConsultationScreen;

