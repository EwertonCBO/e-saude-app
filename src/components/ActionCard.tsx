import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../theme';

interface ActionCardProps {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
  onPress: () => void;
  description?: string;
}

export default function ActionCard({ 
  title, 
  icon, 
  color = COLORS.primary, 
  onPress,
  description
}: ActionCardProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.card, { borderColor: color }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={40} color={COLORS.white} />
      </View>
      <View style={styles.textContainer}>
        <Text variant="titleMedium" style={styles.title}>{title}</Text>
        {description && (
          <Text variant="bodyMedium" style={styles.description}>{description}</Text>
        )}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={32} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.neutralDark,
    marginBottom: 4,
    fontSize: 20,
  },
  description: {
    color: COLORS.neutralMedium,
    fontSize: 16,
  },
});
