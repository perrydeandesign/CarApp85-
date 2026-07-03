import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Camera as VisionCamera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

// vision-camera's exported prop types vary across versions and don't always
// include valid props like `photo`; alias to bypass the mismatched typing.
const Camera = VisionCamera as any;
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function CameraScreen({ navigation }: { navigation?: any }) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  // vision-camera's Camera ref typing is finicky across versions; `any` keeps
  // takePhoto() reachable without fighting the generic.
  const cameraRef = useRef<any>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    setIsTakingPhoto(true);

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        qualityPrioritization: 'quality',
      });

      setPreview(`file://${photo.path}`);
    } catch (err) {
      console.log('Error taking photo:', err);
    }

    setIsTakingPhoto(false);
  };

  const retake = () => {
    setPreview(null);
  };

  const usePhoto = () => {
    navigation?.navigate('PostPreview', { imageUri: preview });
  };

  if (!device) {
    return <ActivityIndicator style={{ flex: 1 }} color="#F0F6FC" />;
  }

  return (
    <View style={styles.container}>
      {!preview ? (
        <>
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            photo={true}
          />

          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={32} color="#F0F6FC" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
              <View style={styles.innerCircle} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: preview }} style={styles.previewImage} />

          <View style={styles.previewActions}>
            <TouchableOpacity onPress={retake} style={styles.actionButton}>
              <Ionicons name="refresh" size={28} color="#F0F6FC" />
              <Text style={styles.actionText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={usePhoto} style={styles.actionButton}>
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
              <Text style={styles.actionText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  topBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 20,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#F0F6FC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerCircle: {
    width: 60,
    height: 60,
    backgroundColor: '#F0F6FC',
    borderRadius: 30,
  },

  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },

  previewImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'cover',
  },

  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },

  actionButton: {
    alignItems: 'center',
  },

  actionText: {
    color: '#F0F6FC',
    marginTop: 6,
    fontSize: 14,
  },
});
