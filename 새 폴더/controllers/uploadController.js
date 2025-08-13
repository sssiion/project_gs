// uploadController.js
const XLSX = require('xlsx');
const fs = require('fs');
const db = require('../models/db');
const { updateInventoryTotalQuantity } = require('./stockController');

exports.uploadExcel = async (req, res) => {
  const filePath = req.file.path;

  // 트랜잭션 시작 함수
  const beginTransaction = () =>
    new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION;', err => (err ? reject(err) : resolve()));
    });
  // 트랜잭션 커밋 함수
  const commitTransaction = () =>
    new Promise((resolve, reject) => {
      db.run('COMMIT;', err => (err ? reject(err) : resolve()));
    });
  // 트랜잭션 롤백 함수
  const rollbackTransaction = () =>
    new Promise((resolve) => {
      db.run('ROLLBACK;', () => resolve());
    });

  try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['sheet2'];
    if (!sheet) throw new Error('"sheet2" 시트를 찾을 수 없습니다.');

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    const parsed = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const code = row[0];
      const name = row[1];
      const quantity = row[8];
      const expiry = null;

      const isLast = i === rows.length - 1;
      const isEmpty = row.every(cell => cell === '');
      const isTotal = typeof code === 'string' && code.includes('합계');

      if (
        code === '상품코드' ||
        name === '상품명' ||
        (!code && !name) ||
        (isLast && (isEmpty || isTotal))
      )
        continue;

      parsed.push({ code, name, quantity, expiry });
    }

    if (parsed.length === 0) {
      fs.unlinkSync(filePath);
      return res.send({ message: '처리할 데이터 없음', count: 0 });
    }

    const groupMap = new Map();
    for (const item of parsed) {
      const key = item.code;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key).push(item);
    }

    // codes 전체 조회
    const codes = Array.from(groupMap.keys());
    const existingInventoryMap = new Map();

    await new Promise((resolve, reject) => {
      if (codes.length === 0) return resolve();
      const placeholders = codes.map(() => '?').join(',');
      const query = `SELECT id, code FROM inventory WHERE code IN (${placeholders})`;
      db.all(query, codes, (err, rows) => {
        if (err) return reject(err);
        rows.forEach(row => existingInventoryMap.set(row.code, row.id));
        resolve();
      });
    });

    await beginTransaction();

    try {
      for (const [code, items] of groupMap.entries()) {
        let inventoryId = existingInventoryMap.get(code);

        // 신규 inventory insert
        if (!inventoryId) {
          inventoryId = await new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO inventory (code, name, totalquantity) VALUES (?, ?, 0)`,
              [code, items[0].name],
              function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
              }
            );
          });
          existingInventoryMap.set(code, inventoryId);
        }

        // quan 데이터 조회
        const quanRows = await new Promise((resolve, reject) => {
          db.all(
            `SELECT id, quantity, expiry FROM quan WHERE inventory_id = ? ORDER BY expiry ASC`,
            [inventoryId],
            (err, rows) => (err ? reject(err) : resolve(rows))
          );
        });

        const excelTotalQty = items.reduce(
          (sum, i) => sum + parseInt(i.quantity || 0, 10),
          0
        );
        const dbTotalQty = quanRows.reduce((sum, row) => sum + row.quantity, 0);
        let diff = dbTotalQty - excelTotalQty;

        // 수량 줄이기 (FIFO)
        if (diff > 0) {
          for (const row of quanRows) {
            if (diff <= 0) break;
            if (row.quantity <= diff) {
              await new Promise(resolve => {
                db.run(`DELETE FROM quan WHERE id = ?`, [row.id], resolve);
              });
              diff -= row.quantity;
            } else {
              const newQty = row.quantity - diff;
              await new Promise(resolve => {
                db.run(
                  `UPDATE quan SET quantity = ? WHERE id = ?`,
                  [newQty, row.id],
                  resolve
                );
              });
              diff = 0;
            }
          }
        }

        // 수량 늘리기
        if (excelTotalQty > dbTotalQty) {
          const addQty = excelTotalQty - dbTotalQty;
          const nullExpiryRow = quanRows.find(r => r.expiry === null);

          if (nullExpiryRow) {
            const newQty = nullExpiryRow.quantity + addQty;
            await new Promise(resolve => {
              db.run(
                `UPDATE quan SET quantity = ? WHERE id = ?`,
                [newQty, nullExpiryRow.id],
                resolve
              );
            });
          } else {
            await new Promise(resolve => {
              db.run(
                `INSERT OR IGNORE INTO quan (inventory_id, quantity, expiry) VALUES (?, ?, NULL)`,
                [inventoryId, addQty],
                err => {
                  if (err) console.error(err);
                  resolve();
                }
              );
            });
          }
        }

        // inventory totalquantity 업데이트
        await updateInventoryTotalQuantity(inventoryId);
      }

      await commitTransaction();
    } catch (err) {
      await rollbackTransaction();
      throw err;
    }

    fs.unlinkSync(filePath);
    res.send({ message: '엑셀 업로드 및 DB 최신화 완료', count: parsed.length });
  } catch (err) {
    console.error('❌ 엑셀 업로드 실패:', err);
    try {
      await rollbackTransaction();
    } catch (_) {}
    res.status(500).send({ error: '엑셀 처리 실패' });
    // 업로드 파일 삭제
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {}
  }
};
