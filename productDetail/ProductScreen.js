import React,{useState} from 'react';
import { View, Text,StyleSheet ,ScrollView,TextInput  } from 'react-native';
import ProductList from './ProductList.js'
import Headercomponent2 from '../productDetail/header2component.js';
import productid from "./productid.js"

const API_SERVER = 'http://10.0.2.2:3000';
const Productname = ( props ) => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expiry, setExpiry] = useState('');
    const [category, setCategory] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [totalquantity, settotalquantity] = useState('');
    


  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);
  
  const fetchItems = async (categoryName) => {
    try {
      const url = categoryName
        ? `${API_SERVER}/api/categories/${encodeURIComponent(categoryName)}/items`
        : `${API_SERVER}/api/stock`;
      const res = await fetch(url);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('❌ 목록 조회 실패:', err);
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

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await fetch(`${API_SERVER}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() })
      });
      if (res.ok) {
        setNewCategory('');
        fetchCategories();
      }
    } catch (err) {
      console.error('❌ 카테고리 추가 실패:', err);
    }
  };

  const updateCategory = async () => {
    if (!editingCategoryId || !newCategory.trim()) return;
    try {
      const res = await fetch(`${API_SERVER}/api/categories/${editingCategoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory.trim() })
      });
      if (res.ok) {
        setEditingCategoryId(null);
        setNewCategory('');
        fetchItems(selectedCategory || undefined);
        fetchCategories();
      }
    } catch (err) {
      console.error('❌ 카테고리 수정 실패:', err);
    }
  };

  const deleteCategory = async (categoryId) => {
    Alert.alert('삭제 확인', `카테고리를 정말 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive', onPress: async () => {
          try {
            const res = await fetch(`${API_SERVER}/api/categories/${categoryId}`, {
              method: 'DELETE',
            });
            if (res.ok) {
              fetchItems(selectedCategory || undefined);
              fetchCategories();
            }
          } catch (err) {
            console.error('❌ 카테고리 삭제 실패:', err);
          }
        }
      }
    ]);
  };
  const totalQuantity = async (productid) => {
    if (!code ) return;
    try {
      const url = `${API_SERVER}/api/stock/id:quantity${productid}`;
      const res = await fetch(url);
      const data = await res.json();
      settotalquantity(data);
    } catch (err) {
      console.error('❌ 목록 조회 실패:', err);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!code || !name || !quantity) return;
    const item = { code, name, quantity: parseInt(quantity), category, expiry };
    

    try {
      const url = `${API_SERVER}/api/stock${editingItem && editingItem.id ? `/${editingItem.id}` : ''}`;
      const method = editingItem && editingItem.id ? 'PATCH' : 'POST';

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

  const handleEdit = (item) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setQuantity(item.quantity.toString());
    setCategory(item.category || '');
    setExpiry(item.expiry || '');
  };

  const resetForm = () => {
    setCode('');
    setName('');
    setQuantity('');
    setCategory('');
    setExpiry('');
    setEditingItem(null);
  };

  const handleSelectCategory = (name) => {
    setSelectedCategory(name);
    fetchItems(name);
  };

  const handleShowAll = () => {
    setSelectedCategory(null);
    fetchItems();
  };


  return (
    <View>
        <Headercomponent2 headertext="expirattion date" />
        {myProductArray.map((productid)=> (
            <productid 
                id={productid.id}
                count={productid.count}
                total={productid.total}
                />
        ))}
        <TextInput
            style={stylesname.input}
            placeholder="여기에 입력..."
            value={text}
            onChangeText={(newText) => setText(newText)}
        />
        //<ProductList indate="2025-01-11" expiredate="2025-06-11" count="3" />
        <ScrollView>
        {myProductArray.map((product)=> (
                <ProductList
                           
                            indate={product.expiredate}
                            expiredate={product.expiredate}
                            count={product.count}
                            />

        ))}
        </ScrollView>
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
    batches: {
        fontSize : 20,
        fontWeight: 'bold',
        padding : 15,

    },
    input: {

        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 20,
        margin: 10,
        paddingHorizontal: 10,

    }
  });

export default Productname;
