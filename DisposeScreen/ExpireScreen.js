import React,{useEffect, useState} from 'react';
import { View, Text,StyleSheet   } from 'react-native';
import Headercomponent2 from '../productDetail/header2component.js';
import ExpireList from '../DisposeScreen/ExpireList';

const API_SERVER = 'http://10.0.2.2:3000'; // 로컬 호스트


const ExpireScreen = ( props) => {
  return (
    <View>
        <Headercomponent2 headertext="폐기 예정"/>
        <ExpireList />
    </View>
  );
};
const stylesname = StyleSheet.create({

  });

export default ExpireScreen;
