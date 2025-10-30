import React from 'react';
import {View, Text, Image, StyleSheet, Switch} from 'react-native';

const AppListItem = ({app, blocked, onToggle}) => {
  return (
    <View style={styles.container}>
      <View style={styles.appInfo}>
        {app.icon ? (
          <Image source={{uri: app.icon}} style={styles.icon} />
        ) : (
          <View style={[styles.icon, styles.placeholder]} />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.label}>{app.label}</Text>
          <Text style={styles.package}>{app.packageName}</Text>
        </View>
      </View>
      <Switch value={blocked} onValueChange={value => onToggle(app, value)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#11182711',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1f2937',
  },
  package: {
    color: '#6b7280',
    fontSize: 12,
  },
});

export default AppListItem;
