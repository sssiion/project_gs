import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductScreen from './ProductScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';



export default function SearchScreen({ route, navigation }) {
  const { categoryName } = route.params;
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchText, setSearchText] = useState('');

  const API_SERVER = 'http://10.0.2.2:3000';

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
                setFilteredItems(data);
                return data;
              } catch (err) {
                console.error('❌ 목록 조회 실패:', err);
              }

            };
  useEffect(() => {
        fetchItems("전체 보기").then((data) => {
            setFilteredItems(data || []);
          });

    }, []);

  const handleItemPress = (item) => {
     navigation.navigate('Product', { item });
  };
  const handleSearch = () => {
    if (!Array.isArray(items)) {
        setFilteredItems([]);
        return;
      }
      const filtered = items.filter((item) =>
        item?.name &&
              item.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredItems(filtered);
    };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={29} color="black" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Search</Text>
        </View>
      </View>

      <View style={styles.searchBarContainer}>

        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Ionicons name="search" size={15} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item, idx) =>
                        (item?.id ? String(item.id)
                          : (item?.name ? item.name
                            : String(idx)))}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemBox}
            onPress={() => handleItemPress(item)}
          >
            <Text style={styles.itemName}>{item.name}</Text>

            <Text style={styles.itemQuantity}>수량: {item.totalquantity }</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    height: 50,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    padding: 10,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  searchBarContainer: {
    flexDirection: 'row',
    marginVertical: 15,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchButton: {
    backgroundColor: '#0EB4FC',
    marginLeft: 10,
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemBox: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemDate: {
    color: '#479fa3',
    marginTop: 3,
  },
  itemQuantity: {
    marginTop: 2,
    color: '#888',
  },
});

