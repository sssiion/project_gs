
// App.tsx (카테고리 수정/삭제 id 기반으로 변경)
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput,
  Button, StyleSheet, TouchableOpacity,
  Alert,
} from 'react-native';

const API_SERVER = 'http://10.0.2.2:3000';

type Item = {
  id?: number;
  code: string;
  name: string;
  quantity: number;
  category?: string;
  expiry?: string;
};

type Category = {
  id: number;
  name: string;
};

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiry, setExpiry] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const fetchItems = async (categoryName?: string) => {
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

  const deleteCategory = async (categoryId: number) => {
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

  const handleAddOrUpdate = async () => {
    if (!code || !name || !quantity) return;
    const item = { code, name, quantity: parseInt(quantity), category, expiry };

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

  const handleDelete = async (id?: number) => {
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

  const handleEdit = (item: Item) => {
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

  const handleSelectCategory = (name: string) => {
    setSelectedCategory(name);
    fetchItems(name);
  };

  const handleShowAll = () => {
    setSelectedCategory(null);
    fetchItems();
  };

  return (
    <View style={styles.container}>
      <Button title=" 재고 새로고침 " onPress={() => fetchItems(selectedCategory || undefined)} />
      <Text style={styles.title}>📦 {selectedCategory ? `카테고리: ${selectedCategory}` : '전체 재고 목록'}</Text>

      <FlatList
        data={items}
        extraData={items}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>
              [{item.code}]{item.category ? `[${item.category}]` : ''} {item.name} - {item.quantity}개
              {item.expiry ? ` (유통기한: ${item.expiry})` : ''}
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Text style={styles.editBtn}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteBtn}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={styles.subtitle}>{editingItem ? '수정 중' : '➕ 새 재고 추가'}</Text>
      <TextInput style={styles.input} placeholder="상품코드" value={code} onChangeText={setCode} />
      <TextInput style={styles.input} placeholder="상품명" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="수량" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="유통기한 (예: 250907)" value={expiry} onChangeText={setExpiry} />
      <TextInput style={styles.input} placeholder="카테고리 직접 입력 또는 선택" value={category} onChangeText={setCategory} />

      <Button title={editingItem ? '수정 완료' : '추가'} onPress={handleAddOrUpdate} />

      <Text style={[styles.subtitle, { marginTop: 20 }]}>📁 카테고리 선택 보기</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        <TouchableOpacity onPress={handleShowAll}>
          <Text style={{ marginRight: 10, padding: 6, borderWidth: 1, borderColor: selectedCategory === null ? 'blue' : '#999', borderRadius: 5 }}>
            전체 보기
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <View key={cat.id} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
            <TouchableOpacity onPress={() => handleSelectCategory(cat.name)}>
              <Text style={{ padding: 6, borderWidth: 1, borderColor: selectedCategory === cat.name ? 'blue' : '#999', borderRadius: 5 }}>{cat.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditingCategoryId(cat.id); setNewCategory(cat.name); }}>
              <Text style={{ marginLeft: 4, color: 'blue' }}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteCategory(cat.id)}>
              <Text style={{ marginLeft: 4, color: 'red' }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Text style={styles.subtitle}>{editingCategoryId ? '✏️ 카테고리 수정 중' : '➕ 카테고리 수동 추가'}</Text>
      <TextInput style={styles.input} placeholder="카테고리명" value={newCategory} onChangeText={setNewCategory} />
      <Button title={editingCategoryId ? '카테고리 수정' : '카테고리 추가'} onPress={editingCategoryId ? updateCategory : addCategory} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 40, padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  subtitle: { fontSize: 16, marginTop: 30, marginBottom: 10 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  itemText: { flex: 1 },
  buttonRow: { flexDirection: 'row' },
  editBtn: { color: 'blue', fontWeight: 'bold', marginRight: 10 },
  deleteBtn: { color: 'red', fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
