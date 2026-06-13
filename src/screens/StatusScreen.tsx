import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import * as Location from 'expo-location';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { COLORS } from '../theme';
import { getPharmacies } from '../database/repositories';
import type { Pharmacy } from '../types/domain';

interface UserCoordinates {
  latitude: number;
  longitude: number;
}

interface LocatedPharmacy extends Pharmacy {
  distanceKm: number | null;
}

type LocationState = 'loading' | 'granted' | 'denied' | 'unavailable';

function toRadians(value: number) {
  return value * (Math.PI / 180);
}

function distanceInKm(from: UserCoordinates, to: UserCoordinates) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
    Math.cos(toLatitude) *
    Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function formatDistance(distanceKm: number | null) {
  if (distanceKm === null) {
    return null;
  }
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1).replace('.', ',')} km`;
}

function serializeForHtml(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function createMapHtml(
  pharmacies: LocatedPharmacy[],
  userCoordinates: UserCoordinates | null,
) {
  const data = serializeForHtml({ pharmacies, userCoordinates });

  return `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossorigin=""
        />
        <style>
          html, body, #map { width: 100%; height: 100%; margin: 0; background: #e6f4f0; }
          .leaflet-control-attribution { font-size: 9px; }
          .leaflet-tooltip { font-family: Arial, sans-serif; font-size: 12px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
        <script>
          const data = ${data};
          const map = L.map('map', { zoomControl: true });
          const pharmacyMarkers = {};
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          const bounds = [];

          if (data.userCoordinates) {
            const userPoint = [
              data.userCoordinates.latitude,
              data.userCoordinates.longitude
            ];
            L.circleMarker(userPoint, {
              radius: 9,
              color: '#ffffff',
              weight: 3,
              fillColor: '#2471A3',
              fillOpacity: 1
            }).addTo(map).bindTooltip('Sua localização');
            bounds.push(userPoint);
          }

          data.pharmacies.forEach((pharmacy, index) => {
            const point = [pharmacy.latitude, pharmacy.longitude];
            const isClosest = Boolean(data.userCoordinates) && index === 0;
            const marker = L.circleMarker(point, {
              radius: isClosest ? 11 : 9,
              color: '#ffffff',
              weight: 3,
              fillColor: isClosest ? '#F8B140' : '#3A8068',
              fillOpacity: 1
            }).addTo(map);
            pharmacyMarkers[pharmacy.id] = marker;
            marker.bindTooltip(pharmacy.title);
            marker.on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'select-pharmacy',
                pharmacyId: pharmacy.id
              }));
            });
            bounds.push(point);
          });

          window.focusPharmacy = (pharmacyId) => {
            const pharmacy = data.pharmacies.find((item) => item.id === pharmacyId);
            const marker = pharmacyMarkers[pharmacyId];
            if (!pharmacy || !marker) return;

            Object.values(pharmacyMarkers).forEach((item) => {
              item.setRadius(9);
              item.setStyle({
                color: '#ffffff',
                weight: 3,
                fillColor: '#3A8068',
                fillOpacity: 1
              });
            });

            marker.setRadius(12);
            marker.setStyle({
              color: '#ffffff',
              weight: 3,
              fillColor: '#F8B140',
              fillOpacity: 1
            });
            marker.bringToFront();
            map.setView([pharmacy.latitude, pharmacy.longitude], 15, {
              animate: true
            });

            setTimeout(() => {
              map.panBy([0, 105], { animate: true });
              marker.openTooltip();
            }, 300);
          };

          if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [34, 34], maxZoom: 14 });
          } else if (bounds.length === 1) {
            map.setView(bounds[0], 14);
          } else {
            map.setView([-23.5505, -46.6333], 11);
          }

          if (data.pharmacies.length > 0) {
            setTimeout(() => window.focusPharmacy(data.pharmacies[0].id), 450);
          }
        </script>
      </body>
    </html>
  `;
}

export default function StatusScreen() {
  const db = useSQLiteContext();
  const { width } = useWindowDimensions();
  const cardsRef = useRef<ScrollView>(null);
  const mapRef = useRef<WebView>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [userCoordinates, setUserCoordinates] = useState<UserCoordinates | null>(null);
  const [locationState, setLocationState] = useState<LocationState>('loading');
  const [canAskLocationAgain, setCanAskLocationAgain] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mapFailed, setMapFailed] = useState(false);

  const locateUser = useCallback(async () => {
    setLocationState('loading');
    try {
      const currentPermission = await Location.getForegroundPermissionsAsync();
      const permission = currentPermission.granted
        ? currentPermission
        : await Location.requestForegroundPermissionsAsync();
      setCanAskLocationAgain(permission.canAskAgain);

      if (!permission.granted) {
        setUserCoordinates(null);
        setLocationState('denied');
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setUserCoordinates(null);
        setLocationState('unavailable');
        return;
      }

      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: 60000,
        requiredAccuracy: 500,
      });
      if (lastKnown) {
        setUserCoordinates({
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
        });
        setLocationState('granted');
        setActiveIndex(0);
        cardsRef.current?.scrollTo({ x: 0, animated: true });
      }

      try {
        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setUserCoordinates({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
        setLocationState('granted');
        setActiveIndex(0);
        cardsRef.current?.scrollTo({ x: 0, animated: true });
      } catch {
        if (!lastKnown) {
          setUserCoordinates(null);
          setLocationState('unavailable');
        }
      }
    } catch {
      setUserCoordinates(null);
      setLocationState('unavailable');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      getPharmacies(db).then((rows) => {
        if (isActive) {
          setPharmacies(rows);
          setIsLoading(false);
        }
      });
      locateUser();

      return () => {
        isActive = false;
      };
    }, [db, locateUser]),
  );

  const locatedPharmacies = useMemo<LocatedPharmacy[]>(() => {
    const rows = pharmacies.map((pharmacy) => ({
      ...pharmacy,
      distanceKm: userCoordinates
        ? distanceInKm(userCoordinates, pharmacy)
        : null,
    }));

    return userCoordinates
      ? rows.sort((first, second) => first.distanceKm! - second.distanceKm!)
      : rows;
  }, [pharmacies, userCoordinates]);

  const mapHtml = useMemo(
    () => createMapHtml(locatedPharmacies, userCoordinates),
    [locatedPharmacies, userCoordinates],
  );

  const selectPharmacy = useCallback((pharmacyId: number) => {
    const index = locatedPharmacies.findIndex((pharmacy) => pharmacy.id === pharmacyId);
    if (index < 0) {
      return;
    }
    setActiveIndex(index);
    cardsRef.current?.scrollTo({ x: index * width, animated: true });
    mapRef.current?.injectJavaScript(`
      window.focusPharmacy && window.focusPharmacy(${pharmacyId});
      true;
    `);
  }, [locatedPharmacies, width]);

  const focusPharmacyOnMap = useCallback((index: number) => {
    const pharmacy = locatedPharmacies[index];
    if (!pharmacy) {
      return;
    }
    setActiveIndex(index);
    mapRef.current?.injectJavaScript(`
      window.focusPharmacy && window.focusPharmacy(${pharmacy.id});
      true;
    `);
  }, [locatedPharmacies]);

  const handleMapMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        pharmacyId?: number;
      };
      if (message.type === 'select-pharmacy' && message.pharmacyId) {
        selectPharmacy(message.pharmacyId);
      }
    } catch {
      // Ignore messages that were not emitted by the embedded map.
    }
  };

  const openRoute = async (pharmacy: Pharmacy) => {
    const destination = `${pharmacy.latitude},${pharmacy.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    await Linking.openURL(url);
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.loading}>
        <ActivityIndicator color={COLORS.primaryGreen} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>
          {locationState === 'granted'
            ? 'Unidades ordenadas pela distância da sua localização.'
            : 'Ative sua localização para descobrir a unidade mais próxima.'}
        </Text>
      </View>

      <View style={styles.mapContainer}>
        {mapFailed ? (
          <View style={styles.mapFallback}>
            <MaterialCommunityIcons name="map-marker-off-outline" size={42} color={COLORS.neutralMedium} />
            <Text style={styles.mapFallbackText}>
              Não foi possível carregar o mapa. Verifique sua conexão.
            </Text>
          </View>
        ) : (
          <WebView
            ref={mapRef}
            source={{ html: mapHtml, baseUrl: 'https://Altocusto.local/' }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={styles.mapLoading}>
                <ActivityIndicator color={COLORS.primaryGreen} />
              </View>
            )}
            onMessage={handleMapMessage}
            onError={() => setMapFailed(true)}
            style={styles.map}
          />
        )}

        {locationState !== 'granted' && (
          <View style={styles.locationBanner}>
            <MaterialCommunityIcons
              name={locationState === 'loading' ? 'crosshairs-gps' : 'map-marker-alert-outline'}
              size={22}
              color={COLORS.primaryGreenDark}
            />
            <Text style={styles.locationBannerText}>
              {locationState === 'loading'
                ? 'Obtendo sua localização...'
                : locationState === 'denied'
                  ? 'Permissão de localização não concedida.'
                  : 'Ative a localização do aparelho para calcular distâncias.'}
            </Text>
            {locationState !== 'loading' && (
              <Button
                compact
                onPress={canAskLocationAgain ? locateUser : Linking.openSettings}
                textColor={COLORS.primaryGreenDark}
              >
                {canAskLocationAgain ? 'Tentar' : 'Ajustes'}
              </Button>
            )}
          </View>
        )}
      </View>

      <View style={styles.bottomSheetContainer}>
        <ScrollView
          ref={cardsRef}
          horizontal
          pagingEnabled
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            if (index >= 0 && index < locatedPharmacies.length) {
              focusPharmacyOnMap(index);
            }
          }}
        >
          {locatedPharmacies.map((pharmacy, index) => {
            const distance = formatDistance(pharmacy.distanceKm);
            return (
              <View key={pharmacy.id} style={[styles.cardWrapper, { width }]}>
                <View style={styles.bottomSheetCard}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.sheetTitle}>{pharmacy.title}</Text>
                    {userCoordinates && index === 0 && (
                      <View style={styles.closestBadge}>
                        <Text style={styles.closestBadgeText}>Mais próxima</Text>
                      </View>
                    )}
                  </View>
                  {distance && (
                    <View style={styles.distanceRow}>
                      <MaterialCommunityIcons name="navigation-variant-outline" size={20} color={COLORS.primaryGreenDark} />
                      <Text style={styles.distanceText}>{distance} em linha reta</Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.neutralMedium} />
                    <Text style={styles.infoText}>{pharmacy.status}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker-outline" size={20} color={COLORS.neutralMedium} />
                    <Text style={styles.infoText}>{pharmacy.address}</Text>
                  </View>
                  <TouchableOpacity style={styles.routeButton} onPress={() => openRoute(pharmacy)}>
                    <Text style={styles.routeButtonText}>Abrir rota no Google Maps</Text>
                    <MaterialCommunityIcons name="directions" size={20} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.pagination}>
          {locatedPharmacies.map((pharmacy, index) => (
            <View
              key={pharmacy.id}
              style={[styles.dot, activeIndex === index && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerSubtitle: { color: COLORS.neutralMedium, marginTop: 4, fontSize: 14 },
  mapContainer: {
    flex: 1,
    minHeight: 320,
    backgroundColor: COLORS.primaryGreenSoft,
  },
  map: { flex: 1, backgroundColor: COLORS.primaryGreenSoft },
  mapLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryGreenSoft,
  },
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  mapFallbackText: {
    color: COLORS.neutralMedium,
    textAlign: 'center',
    marginTop: 12,
  },
  locationBanner: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 4,
  },
  locationBannerText: {
    flex: 1,
    color: COLORS.neutralDark,
    fontSize: 12,
    marginLeft: 8,
  },
  bottomSheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    zIndex: 20,
  },
  cardWrapper: {
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    elevation: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 7,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    color: COLORS.neutralDark,
  },
  closestBadge: {
    backgroundColor: COLORS.secondaryWarningLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  closestBadgeText: {
    color: '#8A6818',
    fontSize: 10,
    fontWeight: 'bold',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  distanceText: {
    marginLeft: 8,
    color: COLORS.primaryGreenDark,
    fontSize: 13,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingRight: 16,
  },
  infoText: {
    marginLeft: 8,
    color: COLORS.neutralMedium,
    fontSize: 13,
    flexShrink: 1,
  },
  routeButton: {
    marginTop: 9,
    backgroundColor: COLORS.primaryGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 24,
  },
  routeButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 8,
  },
  pagination: {
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 4,
  },
  dotActive: { width: 20, backgroundColor: COLORS.primaryGreen },
});
