import React from 'react';
import { View, Text,StyleSheet   } from 'react-native';


const ProductList = ( props) => {

  return (
    <View style={stylesname.listcontainer}>
        
        <View style={{width:'50%',}}>
            <Text style={stylesname.intputproduct}>입고일날짜: {props.indate}</Text>
            <Text style={stylesname.condate}>소비기한:{props.expiredate}</Text>
        </View>
        <View style={stylesname.productcount}>
            <Text style={{fontSize: 15,}} >수량:   {props.count}</Text>
        </View>
    </View>
  );
};
const stylesname = StyleSheet.create({
    listcontainer:{
        height: 50,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',


    },
    intputproduct :{
        fontWeight: 'bold',
        fontSize : 15,
        paddingLeft: 20,

    },
    condate:{
        paddingLeft: 20,

    },
    productcount: {
        fontWeight: 'bold',
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: '50%',
        padding : 10,


    },
  });

export default ProductList;
