// 메인화면에서 카테고리박스 담는 Navigation 화면
import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import Category from './Category';
import axios from 'axios';

const API_SERVER = 'http://10.0.2.2:3000';
//카테고리 박스 누르면 SearchScreen으로 이동
export default function CategoryList({ navigation, categoryType }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${API_SERVER}/categories?type=${categoryType}`);
        setCategories(response.data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [categoryType]);

  // + 버튼 누르면 카테고리 추가하는 함수
  const addCategory = () => {
    setCategories([...categories, { id: Date.now().toString(), name: '새 카테고리' }]);
  };

  const data = [...categories, { id: 'plus-btn', name: '+', isPlus: true }];

  return (
    <View style={{ padding: 15 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item }) =>
          item.isPlus ? (
            <Category
              name="+"
              onPress={addCategory}
            />
          ) : (
            <Category
              name={item.name}
              onPress={() => navigation.navigate('SearchScreen', { categoryId: item.id })}
            />
          )
        }
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
}
