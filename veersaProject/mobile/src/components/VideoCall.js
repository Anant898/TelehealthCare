import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VideoCall = ({ roomUrl, token, isVideoOn, isMicOn }) => {
  // This is a placeholder component
  // In a real implementation, you would integrate Daily.co React Native SDK
  // or use a WebView with Daily.co web SDK

  return (
    <View style={styles.container}>
      <View style={styles.videoPlaceholder}>
        <Text style={styles.placeholderText}>Video Call</Text>
        <Text style={styles.statusText}>
          Video: {isVideoOn ? 'On' : 'Off'} | Mic: {isMicOn ? 'On' : 'Off'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    alignItems: 'center',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.7,
  },
});

export default VideoCall;

