// 서버 SQLite 연결 및 테이블 생성
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '..', 'inventory.db'));

db.serialize(() => {
  // 재고 테이블
  db.run(`
    CREATE TABLE IF NOT EXISTS quan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inventory_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      expiry DATETIME,
      UNIQUE(inventory_id, expiry),
      FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
    )
  `);
  db.run('PRAGMA foreign_keys = ON');
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      totalquantity INTEGER NOT NULL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT,
      categoryType TEXT,
      UNIQUE(category, categoryType)
    )
 `, (err) => {
  if (err) {
    console.error('categories 테이블 생성 실패:', err.message);
  } else {
    console.log('categories 테이블 생성 또는 이미 존재함');
  }
});

db.run(`
    INSERT OR IGNORE INTO categories (category, categoryType)
    VALUES ('전체 보기', '유통')
  `);

  db.run(`
    INSERT OR IGNORE INTO categories (category, categoryType)
    VALUES ('전체 보기', '소비')
  `);
  // 카테고리 테이블
});

module.exports = db;