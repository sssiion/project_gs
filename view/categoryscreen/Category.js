// Category.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Category({ name, onPress, onLongPress, isPlus }) {
const API_SERVER = 'http://10.0.2.2:3000';
  return (
    <TouchableOpacity
      style={[styles.box, isPlus && styles.plusBox]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Text style={isPlus ? styles.plusText : styles.boxText}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    flexBasis: '48%',
    maxWidth: '48%',
    minWidth: '48%',
    backgroundColor:  '#82d6faff',
    marginVertical: 5,
    height: 140,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  boxText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  plusText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 80,
    textAlign: 'center',
  },
});
