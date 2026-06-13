import React, { ReactNode } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const { width } = Dimensions.get('window');

interface SlideLayoutProps {
  slideNumber: number;
  totalSlides: number;
  title: string;
  subtitle?: string;
  titleIcon?: string;
  children: ReactNode;
  backgroundColor?: string;
}

export default function SlideLayout({
  slideNumber,
  totalSlides,
  title,
  subtitle,
  titleIcon,
  children,
  backgroundColor = COLORS.offWhite,
}: SlideLayoutProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Decorative top accent */}
      <View style={styles.topAccent}>
        <View style={styles.accentLine} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.slideIndicator}>
          <Text style={styles.slideNumber}>
            {slideNumber}/{totalSlides}
          </Text>
        </View>

        <View style={styles.titleRow}>
          {titleIcon && (
            <View style={styles.titleIconContainer}>
              <MaterialCommunityIcons
                name={titleIcon as any}
                size={26}
                color={COLORS.primaryBlue}
              />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>

        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topAccent: {
    height: 4,
    backgroundColor: COLORS.primaryBlueSoft,
  },
  accentLine: {
    height: 4,
    width: '40%',
    backgroundColor: COLORS.primaryBlue,
    borderBottomRightRadius: 4,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  slideIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryBlueSoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  slideNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryBlue,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  titleIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBlueSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
});
