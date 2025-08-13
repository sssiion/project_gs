import React, { useEffect, useState } from 'react';
import { View, FlatList ,Button} from 'react-native';
import Expiredate from './expiredate';

const API_SERVER = 'http://10.0.2.2:3000';


// 폐기예정 상품 리스트
export default function ExpirationList() {
  const [items, setItems] = useState([]);
  const calculateRemainingTime = (expiryStr) => {
    const expiryDate = new Date(expiryStr); // DATETIME 문자열을 Date 객체로 파싱
    if (isNaN(expiryDate.getTime())) return '유효하지 않은 날짜';

    const now = new Date();
    const diffMs = expiryDate - now;
    const diffMin = Math.floor(diffMs / 1000 / 60);

    if (diffMin <= 0) return '폐기 시간 지남';
    if (diffMin < 60) return `폐기 ${diffMin}분 전`;

    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;
    return `폐기 ${hours}시간 ${minutes}분 전`;
  };

  useEffect(() => {
    fetchDiscardItems();
    const interval = setInterval(() => {
      fetchDiscardItems();
    }, 30000); // 30초마다 갱신

    return () => clearInterval(interval);
  }, []);

  const fetchDiscardItems = async () => {
    try {
      const res = await fetch(`${API_SERVER}/api/stock/disposal`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('API 응답이 배열이 아님: ' + JSON.stringify(data));
      }

      const processed = data.map(item => ({
        ...item,
        remainingTime: calculateRemainingTime(item.expireDate)
      }));

      setItems(processed);
    } catch (err) {
      console.error('❌ 폐기 예정 재고 조회 실패:', err);
    }
  };

  return (<>
    <Button onPress={fetchDiscardItems} title='최신화' />
    <FlatList
      data={items}
      keyExtractor={(item) => item.id?.toString()}
      renderItem={({ item }) => <Expiredate  item={item} />}
    /></>
  );
}