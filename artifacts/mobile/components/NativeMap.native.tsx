/**
 * Native-only wrapper around react-native-maps.
 * Only bundled on iOS/Android — never on web.
 */
import React from 'react';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';

const ABIDJAN = {
  latitude: 5.3484,
  longitude: -4.0186,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function NativeMap() {
  return (
    <MapView
      style={{ flex: 1 }}
      provider={PROVIDER_DEFAULT}
      initialRegion={ABIDJAN}
      showsUserLocation
      showsMyLocationButton={false}
    />
  );
}
