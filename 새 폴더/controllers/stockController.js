const db = require('../models/db');
// --- 유틸 함수: 코드로 inventory id 조회 ---
function getInventoryIdByCode(code) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT id FROM inventory WHERE code = ?`;
    db.get(sql, [code], (err, row) => {
      if (err) return reject(err);
      if (!row) return resolve(null);
      resolve(row.id);
    });
  });
};

// --- 유틸 함수: inventory 총수량 업데이트 ---
async function updateInventoryTotalQuantity(inventoryId) {
  return new Promise((resolve, reject) => {
    const sumSql = `SELECT COALESCE(SUM(quantity), 0) AS total FROM quan WHERE inventory_id = ?`;
    db.get(sumSql, [inventoryId], (err, row) => {
      if (err) return reject(err);
      const total = row.total;
      const updateSql = `UPDATE inventory SET totalquantity = ? WHERE id = ?`;
      db.run(updateSql, [total, inventoryId], function (err) {
        if (err) return reject(err);
        resolve(total);
      });
    });
  });
}

exports.updateInventoryTotalQuantity = updateInventoryTotalQuantity;
exports.getbatchAll = (req, res) => {
  const sql =  `SELECT * FROM quan`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
    console.log(rows);
  });
};
// 전체 재고 목록 조회 (카테고리, 검색 필터 지원)
exports.getAll = (req, res) => {
  const { category, search } = req.query;
  let sql = `
    SELECT 
      id,
      code, 
      name,
      category,
      (SELECT COALESCE(SUM(quantity), 0) FROM quan q WHERE q.inventory_id = i.id) AS totalquantity
    FROM inventory AS i
    WHERE 1=1
  `;
  const params = [];

  if (category && category.trim() !== '') {
    sql += ` AND category = ?`;
    params.push(category.trim());
  }

  if (search && search.trim() !== '') {
    sql += ` AND name LIKE ?`;
    params.push(`%${search.trim()}%`);
  }

  sql += `
   ORDER BY name ASC
  `;

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// 특정 상품 재고 상세 조회 (배치별) - 필요한가?
exports.getDetail = (req, res) => {
  const { id } = req.params;
  const findCodeSql = `SELECT code FROM inventory WHERE id = ?`;

  db.get(findCodeSql, [id], (err, inventoryrow) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!inventoryrow) return res.status(404).json({ error: '해당 상품을 찾을 수 없습니다.' });


    const getQuanSql = `SELECT id, quantity, expiry FROM quan WHERE inventory_id = ? ORDER BY expiry ASC`;
    db.all(getQuanSql, [id], (err, quanrows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        inventory: inventoryrow,
        quan: quanrows,
      });
    });
  });
};


// 바코드로 상품 조회 - 안쓰는 코드
exports.getDetailByBarcode = (req, res) => {
  const { barcode } = req.params;
  const sql = `SELECT * FROM inventory WHERE code = ?`;

  db.all(sql, [barcode], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) {
      return res.status(404).json({ error: '해당 바코드의 상품을 찾을 수 없습니다.' });
    }
    res.json(rows);
  });
};
exports.updateCategory = (req, res) => {
  const { code } = req.params;
  const { category } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'category는 필수입니다.' });
  }

  const sql = `UPDATE inventory SET category = ? WHERE code = ?`;
  db.run(sql, [category, code], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: '해당 상품을 찾을 수 없습니다.' });
    }
    res.json({ success: true });
  });
};
// 재고 입고/추가 (code + expiry 기준 수량 누적)
exports.postStock = async  (req, res) => {
 try{
    const {  code, name, quantity, expiry } = req.body;
    if (!code || !name || quantity == null) {
    return res.status(400).json({ error: 'code, name, quantity는 필수입니다.' });
  }
  // expiry 처리
    let expiryValue = null;
    if (expiry) {
      const expiryStr = expiry.toString().trim();
      if (expiryStr === '') {
        expiryValue = null;
      } else if (/^\d{4}-\d{2}-\d{2} \d{2}$/.test(expiryStr)) {
        expiryValue = expiryStr + ':00:00';
      } else if (/^\d{8}$/.test(expiryStr)) {
        const yy = expiryStr.substring(0, 2);
        const MM = expiryStr.substring(2, 4);
        const dd = expiryStr.substring(4, 6);
        const HH = expiryStr.substring(6, 8);
        expiryValue = `20${yy}-${MM}-${dd} ${HH}:00:00`;
      } else {
        expiryValue = expiryStr;
      }
    }
    db.serialize(async () => {
      // 1) inventory 존재 여부 확인 혹은 생성
      let inventoryId = await getInventoryIdByCode(code);
      if (!inventoryId) {
        // 신규 생성
        const insertInventorySql = `INSERT INTO inventory (code, name, totalquantity) VALUES (?, ?, 0)`;
        await new Promise((resolve, reject) => {
          db.run(insertInventorySql, [code, name], function (err) {
            if (err) return reject(err);
            inventoryId = this.lastID;
            resolve();
          });
        });
      }
      // 2) quan 테이블에 (inventory_id, expiry) 조건으로 존재 여부 확인 후 insert/update
      const findQuanSql = `SELECT id FROM quan WHERE inventory_id = ? AND (expiry = ? OR (expiry IS NULL AND ? IS NULL))`;
      db.get(findQuanSql, [inventoryId, expiryValue, expiryValue], async (err, quanRow) => {
        if (err) return res.status(500).json({ error: err.message });

        if (quanRow) {
          // 누적 업데이트
          const updateQuanSql = `UPDATE quan SET quantity = quantity + ? WHERE id = ?`;
          db.run(updateQuanSql, [quantity, quanRow.id], async function (err) {
            if (err) return res.status(500).json({ error: err.message });
             try {
              const total = await updateInventoryTotalQuantity(inventoryId);
              res.status(201).json({ success: true, inventoryId, totalQuantity: total });
            } catch (e) {
              res.status(500).json({ error: e.message });
            }
          });
        } else {
          // 신규 insert
          const insertQuanSql = `INSERT INTO quan (inventory_id, quantity, expiry) VALUES (?, ?, ?)`;
          db.run(insertQuanSql, [inventoryId, quantity, expiryValue], async function (err) {
            if (err) return res.status(500).json({ error: err.message });

            try {
              const total = await updateInventoryTotalQuantity(inventoryId);
              res.status(201).json({ success: true, inventoryId, totalQuantity: total });
            } catch (e) {
              res.status(500).json({ error: e.message });
            }
          });
        }
      });
    });
 } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

  
exports.getBatchesByName = (req, res) => {
  const { name } = req.params;
  if (!name) {
    return res.status(400).json({ error: '상품명(name) 파라미터가 필요합니다.' });
  }

  // inventory와 quan을 join해 batch별(유통기한별/수량별)로 리스트화
  const sql = `
    SELECT 
      i.id as inventoryId,
      i.code,
      i.name,
      i.totalquantity,
      i.category,
      q.id as batchId,
      q.quantity,
      q.expiry
    FROM inventory i
    LEFT JOIN quan q ON i.id = q.inventory_id
    WHERE i.name = ?
    ORDER BY q.expiry IS NOT NULL, q.expiry ASC
  `;

  db.all(sql, [name], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // 필요하다면 null batch(배치 없음) row는 제외할 수도 있음
    res.json(rows.filter(row => row.batchId != null && row.quantity != null));
  });
};
  

  
exports.updateTotalQuantityByName = (req, res) => {
  const { name } = req.params; // URL 파라미터로 상품명 받음

  if (!name) {
    return res.status(400).json({ error: '상품 이름(name)이 필요합니다.' });
  }

  // 1. name 으로 inventory id 찾기
  const findInventorySql = `SELECT id FROM inventory WHERE name = ?`;
  db.get(findInventorySql, [name], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: '해당 이름의 상품을 찾을 수 없습니다.' });

    const inventoryId = row.id;

    // 2. quan 에서 inventory_id 기준 총 quantity 합산
    const sumQuanSql = `SELECT COALESCE(SUM(quantity), 0) AS total FROM quan WHERE inventory_id = ?`;
    db.get(sumQuanSql, [inventoryId], (err, sumRow) => {
      if (err) return res.status(500).json({ error: err.message });

      const total = sumRow.total;

      // 3. inventory 테이블 totalquantity 업데이트
      const updateInventorySql = `UPDATE inventory SET totalquantity = ? WHERE id = ?`;
      db.run(updateInventorySql, [total, inventoryId], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        return res.json({
          success: true,
          inventoryId,
          totalQuantity: total,
          message: `상품명 '${name}'에 대한 총 수량이 업데이트 되었습니다.`,
        });
      });
    });
  });
};
/** 
// --- 상품 정보 수정 ---
exports.update = (req, res) => {
  const { id } = req.params;
  const { code, name, expiry, quantity, category } = req.body;

  const inventoryFields = [];
  const inventoryValues = [];
  const quanFields = [];
  const quanValues = [];

  if (code !== undefined) {
    inventoryFields.push('code = ?');
    inventoryValues.push(code);
  }
  if (name !== undefined) {
    inventoryFields.push('name = ?');
    inventoryValues.push(name);
  }
  if (category !== undefined) {
    inventoryFields.push('category = ?');
    inventoryValues.push(category);
  }
  if (expiry !== undefined) {
    quanFields.push('expiry = ?');
    quanValues.push(expiry);
  }
  if (quantity !== undefined) {
    quanFields.push('quantity = ?');
    quanValues.push(quantity);
  }

  if (inventoryFields.length === 0 && quanFields.length === 0) {
    return res.status(400).json({ error: '수정할 필드를 하나 이상 전달해야 합니다.' });
  }
  // app.patch("/api/stock/batch/:batchId", ...)

  // inventory 테이블 업데이트 (code, name, category)
  const updateInventory = () => {
    return new Promise((resolve, reject) => {
      if (inventoryFields.length === 0) return resolve();

      const sql = `UPDATE inventory SET ${inventoryFields.join(', ')} WHERE id = ?`;
      inventoryValues.push(id);
      db.run(sql, inventoryValues, function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error('해당 상품을 찾을 수 없습니다.'));
        resolve();
      });
    });
  };

  // quan 테이블 업데이트 (quantity, expiry)
  const updateQuan = () => {
    return new Promise((resolve, reject) => {
      if (quanFields.length === 0) return resolve();

      const sql = `UPDATE quan SET ${quanFields.join(', ')} WHERE inventory_id = ?`;
      quanValues.push(id);
      db.run(sql, quanValues, function (err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error('해당 재고를 찾을 수 없습니다.'));
        resolve();
      });
    });
  };

  Promise.all([updateInventory(), updateQuan()])
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ error: err.message }));
};*/
exports.update = (req, res) => {
  const { id } = req.params; // inventory id
  const { code, name, category } = req.body;
  const fields = [];
  const values = [];
  if (code !== undefined) { fields.push('code = ?'); values.push(code);}
  if (name !== undefined) { fields.push('name = ?'); values.push(name);}
  if (category !== undefined) { fields.push('category = ?'); values.push(category);}
  if (fields.length === 0) return res.status(400).json({error:'수정할 필드를 입력하세요.'});
  const sql = `UPDATE inventory SET ${fields.join(',')} WHERE id=?`;
  values.push(id);
  db.run(sql, values, function (err) {
    if (err) return res.status(500).json({error: err.message});
    if (this.changes===0) return res.status(404).json({error:'대상이 없습니다.'});
    res.json({success:true});
  });
}
/** 
exports.updateBatch = (req, res) => {
  const { id } = req.params;
  const { quantity, expiry } = req.body;
  // (이하 생략, 앞 답변 참고)
  const updateFields = [];
  const updateValues = [];
  if (quantity !== undefined) {
    updateFields.push('quantity = ?');
    updateValues.push(quantity);
  }
  if (expiry !== undefined) {
    updateFields.push('expiry = ?');
    updateValues.push(expiry);
  }
  if (updateFields.length === 0) {
    return res.status(400).json({ error: '수정할 필드를 하나 이상 전달해야 합니다.' });
  }
  const sql = `UPDATE quan SET ${updateFields.join(', ')} WHERE id = ?`;
  updateValues.push(id);
  db.run(sql, updateValues, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: '해당 배치(quan row)를 찾을 수 없습니다.' });
    res.json({ success: true });
  });
};*/
exports.updateBatch = (req, res) => {
  const { id } = req.params;                     // 수정할 quan.id
  const { quantity, expiry } = req.body;

  // 1. 내 row 정보 조회
  db.get('SELECT inventory_id, quantity, expiry FROM quan WHERE id = ?', [id], (err, myRow) => {
    if (err) {
      console.error('select myRow error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (!myRow) return res.status(404).json({ error: '존재하지 않는 배치입니다.' });

    const inventoryId = myRow.inventory_id;
    const oldQuantity = myRow.quantity;
    const oldExpiry = myRow.expiry;

    // 2. 같은 상품의 모든 배치 row 조회
    db.all('SELECT id, expiry, quantity FROM quan WHERE inventory_id = ?', [inventoryId], (err2, allRows) => {
      if (err2) {
        console.error('select allRows error:', err2);
        return res.status(500).json({ error: err2.message });
      }
      
      
      // 3. 동일 expiry가 이미 있는지(내 row 제외) 찾기
      const normalize = v => (v == null || v === '') ? null : String(v).trim();
      const targetExpiry = normalize(expiry);
      
      const dupeRow = allRows.find(r =>{
        console.log(
          '비교대상 row.id:', r.id,
          '   expiry:', r.expiry,
          '   normalize:', normalize(r.expiry),
          '   target:', targetExpiry,
          '   id와 비교:', r.id, Number(id)
        )
        return (
        r.id !== Number(id) &&
        normalize(r.expiry) === targetExpiry);}
      );

      if (dupeRow) {
        // 이미 해당 expiry 있음 → 그 row에 quantity 누적, 내 row 삭제
        const newQuantity = dupeRow.quantity + (quantity !== undefined ? quantity : oldQuantity);

        db.serialize(() => {
          db.run('UPDATE quan SET quantity = ? WHERE id = ?', [newQuantity, dupeRow.id], (err3) => {
            if (err3) {
              console.error('update dupeRow error:', err3);
              return res.status(500).json({ error: err3.message });
            }
            db.run('DELETE FROM quan WHERE id = ?', [id], async (err4) => {
              if (err4) {
                console.error('delete myRow error:', err4);
                return res.status(500).json({ error: err4.message });
              }
              try {
                await updateInventoryTotalQuantity(inventoryId);
              } catch (e) {
                console.error('updateInventoryTotalQuantity error:', e);
                return res.status(500).json({ error: e.message });
              }
              return res.json({
                success: true,
                mergedToBatchId: dupeRow.id,
                totalQuantity: newQuantity,
              });
            });
          });
        });
      } else {
        // 중복 없음 → 내 row만 update
        const updateFields = [];
        const updateValues = [];
        if (quantity !== undefined) {
          updateFields.push('quantity = ?');
          updateValues.push(quantity);
        }
        if (expiry !== undefined) {
          updateFields.push('expiry = ?');
          updateValues.push(expiry);
        }
        if (updateFields.length === 0) return res.status(400).json({ error: '수정할 값이 없습니다.' });
        updateValues.push(id);
        db.run(`UPDATE quan SET ${updateFields.join(', ')} WHERE id = ?`, updateValues, async (err5) => {
          if (err5) {
            console.error('update myRow error:', err5);
            return res.status(500).json({ error: err5.message });
          }
          try {
            await updateInventoryTotalQuantity(inventoryId);
          } catch (e) {
            console.error('updateInventoryTotalQuantity error:', e);
            return res.status(500).json({ error: e.message });
          }
          return res.json({ success: true });
        });
      }
    });
  });
};


// 상품 삭제
exports.remove = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM inventory WHERE id = ?`;

  db.run(sql, [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      return res.status(404).json({ error: '해당 재고를 찾을 수 없습니다.' });
    }
    res.json({ success: true, deletedId: id });
  });
};

exports.getDiscard = (req, res) => {

   const getKoreanNow = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const time = new Date(utc + 9 * 60 * 60 * 1000);
    return time; // KST (UTC+9)
  };

  const now = new Date();
  const nextHourDate = new Date(now.getTime() + 60 * 60 * 1000);

  const formatDateTime = (date) => {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
  };

  const current = formatDateTime(now);
  const next = formatDateTime(nextHourDate);


  const calculateRemainingTime = (expiryStr) => {
    const expiryDate = new Date(expiryStr);
    

    const kstNow = getKoreanNow();
    const diffMs = expiryDate - kstNow;
    const diffMin = Math.floor(diffMs / 1000 / 60);

    if (diffMin <= 0) return '폐기 시간 지남';
    if (diffMin < 60) return `폐기 ${diffMin}분 남음`;

    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;
    return `폐기 ${hours}시간 ${minutes}분 남음`;
  };

  const sql = `
     SELECT  
      q.id AS batchId,
      datetime(q.expiry) AS expiryDate,
      i.name AS itemName
    FROM quan q
    JOIN inventory i ON q.inventory_id = i.id
    WHERE expiry IS NOT NULL AND expiry != ''
      AND datetime(expiry) > datetime(?)
      AND datetime(expiry) <= datetime(?)
    ORDER BY expiryDate ASC
  `;

  db.all(sql, [current,next], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const processedRows = rows.map(item => ({
      ...item,
      remainingTime: calculateRemainingTime(item.expiryDate),
    }));
    
    res.json(processedRows);
  });
};

exports.getQuantity = (req, res) =>{
  const { id } = req.params;

  const sql = `
    SELECT i.code, i.name, i.category, COALESCE(SUM(q.quantity), 0) AS totalQuantity
    FROM inventory i
    LEFT JOIN quan q ON i.id = q.inventory_id
    WHERE i.id = ?
    GROUP BY i.id
  `;

  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: '해당 상품을 찾을 수 없습니다.' });

    res.json(row); // { code, name, category, totalQuantity }
  });
};
