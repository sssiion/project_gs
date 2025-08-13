import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, SafeAreaView } from 'react-native';
import axios from 'axios'; // 데이터 요청을 위한 axios import
import ProductList from './ProductList.js'; // 개별 상품을 표시하는 컴포넌트
import Headercomponent2 from '../productDetail/header2component.js';

const API_URL = 'http://YOUR_LOCAL_IP_ADDRESS:3000/api';

const Productname = (props) =>{

}