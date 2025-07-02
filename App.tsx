import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput,
  Button, StyleSheet, TouchableOpacity
} from 'react-native';

// SQLite DB 관련 함수들 임포트
import {
  getDBConnection,
  createTable,
  getItems,
  addItem,
  updateItem,
  deleteItem,
  clearTable,
} from './db';

type Item = {
  id?: number;
  code: string;
  name: string;
  quantity: number;
};

const App = () => {
  const [items, setItems] = useState<Item[]>([]); // DB에서 불러온 재고 목록
  const [code, setCode] = useState('');           // 입력용: 상품코드
  const [name, setName] = useState('');           // 입력용: 상품명
  const [quantity, setQuantity] = useState('');   // 입력용: 재고 수량
  const [editingItem, setEditingItem] = useState<Item | null>(null); // 수정 중인 항목

  // 앱 실행 시 DB 초기화
  useEffect(() => {
    initializeDB();
  }, []);

  // SQLite DB 생성 + 서버에서 첫 데이터 불러오기
  const initializeDB = async () => {
    const db = await getDBConnection();
    await createTable(db);

    const localItems = await getItems(db);

    if (localItems.length === 0) {
      // 서버에서 데이터 가져오기
      try {
        const res = await fetch('http://10.0.2.2:3000/data');
        const serverData = await res.json();

        for (const item of serverData) {
          await addItem(db, item);
        }
      } catch (err) {
        console.error('❌ 서버 데이터 요청 실패:', err);
      }
    }

    const updated = await getItems(db);
    setItems(updated);
  };

  // 입력 초기화
  const resetForm = () => {
    setCode('');
    setName('');
    setQuantity('');
    setEditingItem(null);
  };

  // 항목 추가 또는 수정
  const handleAddOrUpdate = async () => {
    if (!code || !name || !quantity) return;

    const db = await getDBConnection();

    if (editingItem && editingItem.id !== undefined) {
      // 수정
      await updateItem(db, editingItem.id, {
        code,
        name,
        quantity: parseInt(quantity),
      });
    } else {
      // 추가
      await addItem(db, {
        code,
        name,
        quantity: parseInt(quantity),
      });
    }

    const updated = await getItems(db);
    setItems(updated);
    resetForm();
  };

  // 수정 버튼 클릭 시
  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setQuantity(item.quantity.toString());
  };

  // 삭제 버튼 클릭 시
  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    const db = await getDBConnection();
    await deleteItem(db, id);
    const updated = await getItems(db);
    setItems(updated);
    resetForm();
  };

  // DB 초기화 버튼
  const handleReset = async () => {
    const db = await getDBConnection();
    await clearTable(db);
    await createTable(db);

    try {
      const res = await fetch('http://10.0.2.2:3000/data');
      const serverData = await res.json();

      for (const item of serverData) {
        await addItem(db, item);
      }

      const updated = await getItems(db);
      setItems(updated);
      resetForm();
      alert('✅ DB가 초기화되었습니다.');
    } catch (err) {
      console.error('❌ 초기화 중 오류:', err);
      alert('⚠️ 서버에서 데이터를 가져오는 데 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>재고 목록</Text>

      {/* 재고 리스트 */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemText}>
                [{item.code}] {item.name} - {item.quantity}개
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
      </View>

      {/* 입력 폼 */}
      <Text style={styles.subtitle}>
        {editingItem ? '✏️ 수정 중' : '➕ 재고 추가'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="상품코드"
        value={code}
        onChangeText={setCode}
      />
      <TextInput
        style={styles.input}
        placeholder="상품명"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="재고 수량"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />
      <Button
        title={editingItem ? '수정 완료' : '추가'}
        onPress={handleAddOrUpdate}
      />
      <View style={{ marginTop: 10 }} />
      <Button
        title="📦 DB 초기화"
        color="orange"
        onPress={handleReset}
      />
    </View>
  );
};

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

export default App;
