import React from 'react';
import { View, Text,StyleSheet ,TouchableOpacity,SafeAreaView  } from 'react-native';

import Headercomponent2 from '../productDetail/header2component.js';
import Expirationdate from '../DisposeScreen/expiredate.js';

const Category = ( props) => {

  return (
    <View >
        <TouchableOpacity style={stylesname.category} onPress={props.onPress}>
            <Text style={stylesname.text}>{props.name}</Text>
        </TouchableOpacity>
    </View>
  );
};
const stylesname = StyleSheet.create({

    category: {
        backgroundColor: 'skyblue',
        width: '175',
        height: '100',
        marginTop: '20',
        marginLeft: '20'

      },
      text:{
        padding: '10',
      }
  });

export default Category;
