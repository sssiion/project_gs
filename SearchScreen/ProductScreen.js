import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator ,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

 //실제 로직
export default function ProductScreen({ route,navigation  }) {
 // const { items } = route.params;
    const {item} =route.params;
    const [batches, setBatches] = useState([]);
    const [totalQuantity, setTotalQuantity] = useState(-1);
    const [loading, setLoading] = useState(true);
    const API_SERVER = 'http://10.0.2.2:3000';






    useEffect(() => {
     if (!item || !item.name) return;
    const fetchBatches = async () => {
            setLoading(true);
            try {
              // 상품명 name이 쿼리 파라미터로 포함된 URL 요청
              const res = await fetch(`${API_SERVER}/api/stock/batches/${encodeURIComponent(item.name)}`);
              const data = await res.json();
              const res2 = await fetch(`${API_SERVER}/api/stock?search=${encodeURIComponent(item.name)}`)
              const data2 = await res2.json();
              const totalQty =
                      Array.isArray(data2) && data2.length > 0
                        ? data2[0].totalQuantity
                        : (data2.totalQuantity ?? 0);
              setTotalQuantity(typeof totalQty === 'number' ? totalQty : 0);

              // 안전하게 필터링한 결과를 다시 한 번 검증 (서버에서 필터 안된 경우 대비)
              const filtered = Array.isArray(data) ? data.filter(d => d.name === item.name) : [];


              setBatches(filtered);



            } catch (e) {
              console.error('❌ 상품 배치 데이터 불러오기 실패:', e);
              setBatches([]);
              setTotalQuantity(0);
            } finally {
              setLoading(false);
            }
          };
        fetchBatches();
      }, [item?.name]);
      const formatExpireDate =(expiryStr) => {

            if (!expiryStr) return 'N/A';
            const date = new Date(expiryStr);
            if (isNaN(date.getTime())) return expiryStr;
            const yyyy = date.getFullYear();
            const MM = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const HH = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');

            return `${yyyy}년 ${MM}월 ${dd}일 ${HH}시 ${mm}분`;

      }

     const renderBatch = ({ item }) => (
     <TouchableOpacity onPress={() => navigation.navigate('EditProduct', { item })} >
        <View style={styles.batchItem}>

          <Text style={styles.expirationDate}>Expiration Date: {item.expiry || 'N/A'}</Text>
          <Text style={styles.quantity}>{item.quantity}</Text>
        </View>
     </TouchableOpacity>
      );

    if (!item || !item.name) {
        return (
          <View style={styles.centered}>

            <Text style={{ color: 'red' }}>상품 정보를 불러올 수 없습니다.</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
              <Text style={{ color: 'blue' }}>돌아가기</Text>
            </TouchableOpacity>
          </View>
        );
      }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
      </View>

      {/* 상품 정보 */}
      <View style={styles.content}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.totalQuantity}>Total Quantity: {item.totalquantity}</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0EB4FC" style={{ marginTop: 30 }} />
        ) : batches.length === 0 ? (
          <Text style={{ color: '#666', marginTop: 30 }}>해당 상품의 배치가 없습니다.</Text>

        ) : (
          <FlatList
            data={batches}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderBatch}
          />
        )}
      </View>

      {/* 수정 버튼 */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProduct', { item })}
      >
        <Text style={styles.editButtonText}>Edit</Text>
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
  content: {
    marginTop: 20,
    flex: 1,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  totalQuantity: {
    fontSize: 16,
    marginBottom: 15,
  },
  batchItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  batchLabel: {
    fontWeight: 'bold',
  },
  expirationDate: {
    color: '#0EB4FC',
    marginTop: 2,
  },
  quantity: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#0EB4FC',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
