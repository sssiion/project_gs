import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import Header from './Header';
import BarCodeButton from './BarCodeButton';
import NavScreen from './NavScreen';

export default function MainActivity({ navigation }) { 
  const [showScanner, setShowScanner] = useState(false);
  const [scannedResult, setScannedResult] = useState('');
//바코드 버튼 누르면 BarcodeScannerScreen으로 이동
  return (
    <>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        barStyle="dark-content"
      />

      <SafeAreaView style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <Header text="Inventory Management" />
        </View>

        {/* content */}
        <View style={styles.content}>
          <NavScreen />
        </View>

        {/* footer */}
        <View style={styles.footer}>
          <BarCodeButton onPress={() => navigation.navigate('BarcodeScannerScreen')} />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 0.8,
    backgroundColor: 'white',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  content: {
    flex: 8,
  },
  footer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
