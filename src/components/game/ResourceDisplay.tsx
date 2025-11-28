import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {formatNumber} from '../../utils/formatters';

interface ResourceDisplayProps {
  scrap: number;
  blueprints: number;
  builders: {total: number; available: number};
}

export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  scrap,
  blueprints,
  builders,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.resource}>
        <Text style={styles.icon}>⚙️</Text>
        <Text style={styles.value}>{formatNumber(scrap)}</Text>
        <Text style={styles.label}>Scrap</Text>
      </View>
      <View style={styles.resource}>
        <Text style={styles.icon}>📘</Text>
        <Text style={styles.value}>{formatNumber(blueprints)}</Text>
        <Text style={styles.label}>Blueprints</Text>
      </View>
      <View style={styles.resource}>
        <Text style={styles.icon}>👷</Text>
        <Text style={styles.value}>
          {builders.available}/{builders.total}
        </Text>
        <Text style={styles.label}>Builders</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a2e',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  resource: {
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
});
