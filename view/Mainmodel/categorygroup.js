import React, { useEffect, useState } from 'react';
import { View, Text,StyleSheet ,SafeAreaView  } from 'react-native';

import Headercomponent2 from '../productDetail/header2component.js';
import Expirationdate from '../DisposeScreen/expiredate.js';
import Category from './category.js';

const API_SERVER = 'http://10.0.2.2:3000';

const Categorygroup = ( props) => {
    useEffect(() => {
        fetchCategories();
        fetchItems();
      }, []);

  return (
    <View style={stylesname.container}>
        <SafeAreaView style={stylesname.categorygroup}>
            <Category categoryname="햄버거" />
            <Category categoryname="김밥" />
            <Category categoryname="젤리" />

        </SafeAreaView>
    </View>
  );
};
const stylesname = StyleSheet.create({
    container: {
        flex :1,
        width: "100%",

      },
    categorygroup:{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        width:'100%',

        flex: 1,


      },
  });

export default Categorygroup;
