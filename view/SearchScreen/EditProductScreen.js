import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function EditProductScreen({ route, navigation }) {

  const { item } = route.params;
  const API_SERVER = 'http://10.0.2.2:3000';
  const [name, setName] = useState(item.name || '');
  const [quantity, setQuantity] = useState(String(item.quantity || ''));
  const [expireDate, setExpireDate] = useState(item.expireDate || '');

  const settingDate = (text) => {
    const digits = text.replace(/\D/g, '');

    return `20${digits.slice(0,2)}-${digits.slice(2,4)}-${digits.slice(4,6)} ${
                                                                               digits.length >= 8 ? digits.slice(6,8) : '00'}:00:00`;
  }
  const formatExpireDateForDisplay = (text) => {
    if (!text) return '';
    // 숫자만 남기기 (필요에 따라)
    const digits = text.replace(/\D/g, '');

    // ex) "20250724" → "2025/07/24"
    if(digits.length >=8){
        return `${digits.slice(0,2)}년 ${digits.slice(2,4)}월 ${digits.slice(4,6)}일 ${digits.slice(6,8)}시 `;
    }
    else if (digits.length >= 6) {
      return `${digits.slice(0,2)}년 ${digits.slice(2,4)}월 ${digits.slice(4,6)}일`;
    } else if (digits.length >= 4) {
      return `${digits.slice(0,2)}년 ${digits.slice(2,4)}월`;
    } else if (digits.length > 2) {
      return `${digits.slice(0,2)}년 ${digits.slice(2)}`;
    } else {
      return digits; // 4자리 이하일땐 그대로
    }
  };
  const handleSave = () => {
    if (!quantity || !expireDate) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }

    // 저장 로직 추가 (예: API 요청)

    Alert.alert('저장 완료', '상품 정보가 수정되었습니다.');
    navigation.goBack();
  };
  const handleEdit = async () => {
      try {
        const newExpire = settingDate(expireDate);
        setExpireDate(newExpire);
        let updateData;

        let res;
        if (item.quantity > quantity) {
                // 배치 추가(새로운 quan row)
                // /api/stock POST (body에 code, name, quantity, expiry 필요)
                updateData = {
                        code: item.code,
                        name: item.name,
                        quantity: parseInt(item.quantity,10)-parseInt(quantity, 10),
                        expiry : (item.expireDate || null)

                        };

                res = await fetch(`${API_SERVER}/api/stock/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updateData),
                });
                const result = await res.json();console.log('됨');
              }
      // 기존 배치 수정/삭제
      updateData = {
              quantity: parseInt(quantity, 10),
              expiry : newExpire,

              };
        res = await fetch(`${API_SERVER}/api/stock/batch/${item.batchId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });


        if (!res.ok) {
              const errorText = await res.text();
              console.error('업데이트 실패:', errorText);
              console.log(updateData);
              throw new Error(`서버 에러: ${res.status}`);
            }
            const result = await res.json();
            console.log('업데이트 성공:', result);
            navigation.goBack();
      } catch (err) {
        console.error('❌ 업데이트 실패:', err);
      }
    };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Product</Text>
      </View>

      {/* 폼 입력 */}
      <View style={styles.form}>
        <Text style={styles.label}>상품 이름</Text>
        <TextInput
          value={name}
          editable={false}
          placeholder="예: 유기농 바나나"
          style={styles.input}
        />

        <Text style={styles.label}>수량</Text>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          placeholder="예: 10"
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>
         {expireDate ? formatExpireDateForDisplay(expireDate) : '("25-07-23 20 기호 없이 작성")'}
        </Text>
        <TextInput
          value={expireDate}
          onChangeText={setExpireDate}
          placeholder="예: 2025-07-01"
          style={styles.input}
        />
      </View>

      {/* 저장 버튼 */}
      <TouchableOpacity style={styles.saveButton} onPress={handleEdit}>
        <Text style={styles.saveButtonText}>저장</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginRight: 30,
  },
  form: {
    marginTop: 30,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: 'black',
    height: 40,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#0EB4FC',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
