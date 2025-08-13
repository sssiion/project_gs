import React from 'react';
import { View, Text,StyleSheet   } from 'react-native';

import Headercomponent2 from '../productDetail/header2component.js';
import Expirationdate from '../DisposeScreen/expiredate.js';

const ExpireScreen = ( props) => {

  return (
    <View>
        <Headercomponent2 headertext="상품"/>
        <Expirationdate />



    </View>
  );
};
const stylesname = StyleSheet.create({

  });

export default ExpireScreen;
