import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function LocacionesScreen() {
  return <View style={styles.container}><Text style={styles.text}>Locaciones (Próximamente)</Text></View>;
}
const styles = StyleSheet.create({container: {flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#121212'},text:{fontSize:18,color:'white'}});