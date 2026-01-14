import React from 'react';
import MapView, { Marker } from 'react-native-maps';

interface MapViewNativeProps {
  style: any;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onPress: (e: any) => void;
  markerLatitude: number;
  markerLongitude: number;
  markerTitle: string;
  markerDescription: string;
}

export function MapViewNative({
  style,
  initialRegion,
  onPress,
  markerLatitude,
  markerLongitude,
  markerTitle,
  markerDescription,
}: MapViewNativeProps) {
  return (
    <MapView style={style} initialRegion={initialRegion} onPress={onPress}>
      <Marker
        coordinate={{
          latitude: markerLatitude,
          longitude: markerLongitude,
        }}
        title={markerTitle}
        description={markerDescription}
      />
    </MapView>
  );
}
