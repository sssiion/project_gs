import React,{useState} from 'react';
import { View, Text,StyleSheet ,ScrollView,TextInput  } from 'react-native';
import ProductList from './ProductList.js'
import Headercomponent2 from '../productDetail/header2component.js';


const Productid = ( props ) => {
    
  return (
    <View>
        <Text style={stylesname.product}>{props.id}</Text>
        <Text style={stylesname.totalquantity}>입고 수량: {props.count}</Text>
        <Text> 총 수량 : {props.totalQuantity}</Text>
    </View>
  );
};
const stylesname = StyleSheet.create({
    product : {
        fontSize: 20,

        fontWeight: 'bold',
        padding: 10, paddingLeft: 15,
        width: '100%',
    },
    totalquantity: {
        fontSize: 15,
        paddingHorizontal: 15,
        width: '100%',


    },
    
  });

export default Productid;
