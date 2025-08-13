import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import Expiredate from './expiredate';

const API_SERVER = 'http://10.0.2.2:3000';
//기존 텍스트 형식으로 받아오는 유통기한 Date 객체로 변환
const parseExpiryString = (expiryStr) => {
  if (!expiryStr || expiryStr.length !== 8) return null;

  const year = 2000 + parseInt(expiryStr.slice(0, 2));
  const month = parseInt(expiryStr.slice(2, 4)) - 1;
  const day = parseInt(expiryStr.slice(4, 6));
  const hour = parseInt(expiryStr.slice(6, 8));

  return new Date(year, month, day, hour);
};

const calculateRemainingTime = (expiryStr) => {
  const expiryDate = parseExpiryString(expiryStr);
  if (!expiryDate) return '유통기한 없음';

  const now = new Date();
  const diffMs = expiryDate - now;
  const diffMin = Math.floor(diffMs / 1000 / 60);

  if (isNaN(diffMin)) return '유효하지 않은 날짜';
  if (diffMin <= 0) return '폐기 시간 지남';
  if (diffMin < 60) return `폐기 ${diffMin}분 전`;
  //사실 필요없음 나중에 알림 시간 더 늘리면 쓸지도
  const m = diffMin % 60;
  return `${m}분 전`;
};

//폐기예정 상품 리스트
export default function ExpirationList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchDiscardItems();
    const interval = setInterval(() => {
        fetchDiscardItems(); // 30초마다 호출 - 시간은 변경가능
      }, 30000);

      return () => clearInterval(interval);
  }, []);
  //서버에서 getDiscard() 사용해서 폐기 1시간 남은 상품들 반환
  const fetchDiscardItems = async () => {
    try {
      const res = await fetch(`${API_SERVER}/api/stock/disposal`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error('API 응답이 배열이 아님: ' + JSON.stringify(data));
      }

      const processed = data.map(item => ({
        ...item, // 기존 Item 내의 모든 속성 복사
        remainingTime: calculateRemainingTime(item.expiry) //calculateRemaininTime()함수 사용해서 남으시간 필드 추가
      }));

      setItems(processed);
    } catch (err) {
      console.error('❌ 폐기 예정 재고 조회 실패:', err);
    }
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id?.toString()}
      renderItem={({ item }) => <Expiredate item={item} />}
    />
  );
}
