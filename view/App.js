/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import React, { useEffect, useState } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import axios from 'axios';
import { Platform, StatusBar, SafeAreaView, useColorScheme, View, Text, FlatList, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchScreen from './SearchScreen/SearchScreen.js'
import ProductScreen from './SearchScreen/ProductScreen.js';
import EditProduct from './SearchScreen/EditProductScreen.js';
import Headercomponent2 from './productDetail/header2component.js';
import DisposeScreen from './DisposeScreen/ExpireScreen.js';

import NavScreen from './NavScreen';

const API_SERVER = 'http://10.0.2.2:3000';

const Stack = createNativeStackNavigator();
function MainScreen( {navigation }) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [totalQuantity, setTotalQuantity] = useState('');
    const [expiry, setExpiry] = useState('');


    //const [editingItem, setEditingItem] = useState(null);
    //const [editingCategoryId, setEditingCategoryId] = useState(null);

     useEffect(() => {

        fetchCategories();
        fetchItems();

      }, []);

      const fetchItems = async (categoryName) => {
          try {
            let url = '';
            if (categoryName && categoryName.trim() !== '') {
                    if(categoryName == '전체 보기'){
                      url = `${API_SERVER}/api/stock`;
                    }
                    else{
                      url = `${API_SERVER}/api/categories/${encodeURIComponent(categoryName)}/items`;
                    }
                  } else {
                    url = `${API_SERVER}/api/stock`; // 전체 품목

                  }
            const res = await fetch(url);
            const data = await res.json();
            setItems(data);
            return data;
          } catch (err) {
            console.error('❌ 목록 조회 실패:', err);
          }

        };

        const getCategories = async ({categoryType}) =>{
            try{
                const response = await axios.get(`${API_SERVER}/api/categories/category_Type/${categoryType}`);
                setCategories(response.data);
                return response.data; // setCategories 대신 결과 반환!
            }catch (e) {
                     console.error('카테고리 로드 실패:', e);

                       if (e.response) {
                         console.error('응답 에러:', e.response.status, e.response.data);
                       } else if (e.request) {
                         console.error('요청 에러:', e.request);
                       } else {
                         console.error('기타 에러:', e);
                 }return [];
                   }
        };
        const fetchCategories = async () => {
          try {
            const res = await fetch(`${API_SERVER}/api/categories`);
            const data = await res.json();
            setCategories(data);
          } catch (err) {
            console.error('❌ 카테고리 조회 실패:', err);
          }
        };
        // 새 카테고리 서버에 추가 요청 및 로컬 상태 업데이트
          const handleAddCategory = async ({newCategory,categoryType }) => {
            if (!newCategory.trim()) return; // 빈 입력 방지
            try {
              const response = await axios.post(`${API_SERVER}/api/categories`, {
                category: newCategory.trim(),
                categoryType: categoryType,
              });
              console.log("새카테고리생성");
              // 서버에서 추가된 카테고리 받아서 목록에 추가
              await getCategories({categoryType})
             // closeAddModal();
            } catch (err) {
              console.error('카테고리 추가 실패:', err);
            }
          };

          // 카테고리 이름 수정 서버 요청 및 로컬 상태 업데이트
          const handleEditCategory = async ({editCategoryName,selectedCategoryId}) => {
            if (!editCategoryName.trim()) return; // 빈 입력 방지
            try {
              await axios.put(`${API_SERVER}/api/categories/${selectedCategoryId}`, {
                category: editCategoryName.trim(),
              });
              // 로컬 상태도 수정한 이름으로 업데이트
              const updated = categories.map((cat) =>
                cat.id === selectedCategoryId ? { ...cat, category: editCategoryName.trim() } : cat
              );
              setCategories(updated);
             // closeEditModal();
            } catch (err) {
              console.error('카테고리 수정 실패:', err);
            }
          };

          // 카테고리 삭제 서버 요청 및 로컬 상태 업데이트
          const handleDeleteCategory = async ({selectedCategoryId}) => {
            try {
              await axios.delete(`${API_SERVER}/api/categories/${selectedCategoryId}`);
              setCategories(categories.filter((cat) => cat.id !== selectedCategoryId));
              //setActionModalVisible(false);
              //setSelectedCategoryId(null);
              //setSelectedCategoryName('');
            } catch (err) {
              console.error('카테고리 삭제 실패:', err);
            }
          };


        const handleAddOrUpdate = async () => {
          if (!code || !name || !totalQuantity) return;
          const item = { code, name, totalQuantity: parseInt(totalQuantity), category, expiry };

          try {
            const url = `${API_SERVER}/api/stock${editingItem?.id ? `/${editingItem.id}` : ''}`;
            const method = editingItem?.id ? 'PATCH' : 'POST';

            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            });

            if (!res.ok) throw new Error('등록/수정 실패');
            await fetchItems(selectedCategory || undefined);
            resetForm();
          } catch (err) {
            console.error('❌ 등록/수정 실패:', err);
          }
        };

        const handleDelete = async (id) => {
          if (!id) return;
          try {
            const res = await fetch(`${API_SERVER}/api/stock/${id}`, {
              method: 'DELETE',
            });
            if (!res.ok) throw new Error('삭제 실패');
            await fetchItems(selectedCategory || undefined);
            resetForm();
          } catch (err) {
            console.error('❌ 삭제 실패:', err);
          }
        };



        const resetForm = () => {
          setCode('');
          setName('');
          setTotalQuantity('');
          setCategory('');
          setExpiry('');
          setEditingItem(null);
        };






  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Headercomponent2 headertext="메인 헤더" />
      <View style={styles.content}>
          <NavScreen items={items} navigation={navigation} getCategories={getCategories} categories={categories}
                     handleAddCategory={handleAddCategory}
                     handleEditCategory={handleEditCategory}
                     handleDeleteCategory={handleDeleteCategory}
                     fetchItems={fetchItems}
                     />
      </View>
      <Button title="dispose" onPress={() => navigation.navigate('DisposeScreen')} />
    </SafeAreaView>
  );
}


export default function App() {
 const isDarkMode = useColorScheme() === 'dark';
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>

          <Stack.Screen
                name="Header"
                component={MainScreen}
                options={{ headerShown: false }}
          />
          <Stack.Screen
                          name="SearchScreen"
                          component={SearchScreen}
                          options={{ headerShown: false }}
                    />
          <Stack.Screen
                        name="Product"
                        component={ProductScreen}
                        options={{ headerShown: false }}
                              />
          <Stack.Screen
                         name="EditProduct"
                         component={EditProduct}
                         options={{ headerShown: false }}
                               />

          <Stack.Screen
                           name="DisposeScreen"
                           component={DisposeScreen}
                           options={{ headerShown: false }}
                                 />



        </Stack.Navigator>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex :1,

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



