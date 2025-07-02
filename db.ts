import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true); // 비동기 방식 사용을 위해 Promise 모드 활성화

// DB 연결 열기
const getDBConnection = async () => {
  return SQLite.openDatabase({ name: 'inventory.db', location: 'default' });
};

// 재고 테이블 생성 (없을 경우)
const createTable = async (db: SQLite.SQLiteDatabase) => {
  const query = `
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT, -- 기본 키
      code TEXT,        -- 상품코드
      name TEXT,        -- 상품명
      quantity INTEGER  -- 수량
    );
  `;
  await db.executeSql(query);
};

// 모든 재고 항목 조회
const getItems = async (db: SQLite.SQLiteDatabase) => {
  const results = await db.executeSql('SELECT * FROM inventory');
  const items = results[0].rows.raw(); // 결과를 배열로 변환
  return items;
};

// 항목 추가
const addItem = async (
  db: SQLite.SQLiteDatabase,
  item: { code: string; name: string; quantity: number }
) => {
  await db.executeSql(
    'INSERT INTO inventory (code, name, quantity) VALUES (?, ?, ?)',
    [item.code, item.name, item.quantity]
  );
};

// 항목 수정
const updateItem = async (
  db: SQLite.SQLiteDatabase,
  id: number,
  item: { code: string; name: string; quantity: number }
) => {
  await db.executeSql(
    'UPDATE inventory SET code = ?, name = ?, quantity = ? WHERE id = ?',
    [item.code, item.name, item.quantity, id]
  );
};

// 항목 삭제
const deleteItem = async (db: SQLite.SQLiteDatabase, id: number) => {
  await db.executeSql('DELETE FROM inventory WHERE id = ?', [id]);
};

// 전체 테이블 초기화
const clearTable = async (db: SQLite.SQLiteDatabase) => {
  await db.executeSql('DELETE FROM inventory');
};

export {
  getDBConnection,
  createTable,
  getItems,
  addItem,
  updateItem,
  deleteItem,
  clearTable,
};
