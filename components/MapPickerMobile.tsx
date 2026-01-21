import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';

interface MapPickerMobileProps {
  mapRegion: any;
  setMapRegion: (region: any) => void;
  pickedLocation: { latitude: number; longitude: number } | null;
  setPickedLocation: (loc: { latitude: number; longitude: number }) => void;
}

export default function MapPickerMobile({ mapRegion, setMapRegion, pickedLocation, setPickedLocation }: MapPickerMobileProps) {
  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPickedLocation({ latitude, longitude });
  };
  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.mapImage}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        onPress={handleMapPress}
      >
        {pickedLocation && (
          <Marker coordinate={pickedLocation} />
        )}
      </MapView>
      <View style={styles.mapOverlay} pointerEvents="none">
        <Ionicons name="location" size={40} color="#e91e63" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
});
