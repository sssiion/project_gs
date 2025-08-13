// 📁 categoryController.js (상품 없어도 categories.id로 삭제/수정 보장 + 프론트 대응용 id 포함 응답)
const db = require('../models/db');

// 카테고리 테이블 생성


// 카테고리 전체 조회 (id 포함)
exports.getAll = (req, res) => {
  const { categoryType } = req.query;
  const query = categoryType
    ? 'SELECT id, category, categoryType FROM categories WHERE categoryType = ?'
    : 'SELECT id, category, categoryType FROM categories';

  const params = categoryType ? [categoryType] : [];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};
exports.getByCategoryType = (req, res) =>{
  const {categoryType} = req.params;
  db.all(
    `SELECT id, category, categoryType FROM categories WHERE categoryType= ?`,
    [categoryType],
    (err, rows) => {
      if (err) return res.status(500).json({error: err.message});
      res.json(rows);
    }
  );
};
// 카테고리 수동 추가
exports.create = (req, res) => {
  const { category, categoryType } = req.body;
  const trimCategory = (category||'').trim(), trimType = (categoryType||'').trim();
  if (!trimCategory ) {
    return res.status(400).json({ error: '카테고리 이름이 필요합니다.' });
  }
  if (!trimType) {
    return res.status(400).json({ error: '카테고리 타입이 필요합니다.' });
  }
 db.get(
    `SELECT id FROM categories WHERE LOWER(category) = LOWER(?) AND categoryType = ?`,
    [trimCategory, trimType],
    (err, existRow) => {
      if (err) return res.status(500).json({ error: err.message });
      if (existRow)
        return res.status(409).json({ error: '이미 존재하는 카테고리입니다.' });
      db.run(
        `INSERT INTO categories (category, categoryType) VALUES (?, ?)`,
        [trimCategory, trimType],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ id: this.lastID, category: trimCategory, categoryType: trimType });
        }
      );
    }
  );
};

// ✅ 수정: categories.id 우선 → inventory.id fallback → 둘 다 없으면 에러
exports.update = (req, res) => {
  const { id } = req.params;

  const newCategory = (req.body.category||'').trim();
  if (!newCategory) return res.status(400).json({ error: '새 카테고리명이 필요합니다.' });

  db.get(`SELECT categoryType FROM categories WHERE id = ?`, [id], (err, catRow) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!catRow) return res.status(404).json({ error: '카테고리를 찾을 수 없습니다.' });
    db.get(
      `SELECT id FROM categories WHERE LOWER(category) = LOWER(?) AND categoryType = ? AND id != ?`,
      [newCategory, catRow.categoryType, id],
      (dupErr, dupRow) => {
        if (dupErr) return res.status(500).json({ error: dupErr.message });
        if (dupRow) return res.status(409).json({ error: '이미 존재하는 카테고리명입니다.' });
        db.get(`SELECT category FROM categories WHERE id = ?`, [id], (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          const oldCategory = row.category;
          db.serialize(() => {
            db.run(`UPDATE categories SET category = ? WHERE id = ?`, [newCategory, id], (updateErr) => {
              if (updateErr) return res.status(500).json({ error: updateErr.message });
              db.run(`UPDATE inventory SET category = ? WHERE category = ?`, [newCategory, oldCategory], (invErr) => {
                if (invErr) return res.status(500).json({ error: invErr.message });
                res.json({ success: true, oldCategory, newCategory });
              });
            });
          });
        });
      }
    );
  });
};

// ✅ 삭제: categories.id 우선 → inventory.id fallback → 둘 다 없으면 에러
exports.remove = (req, res) => {
  const { id } = req.params;

  // 기존 카테고리명이 뭔지 조회
  db.get(`SELECT category FROM categories WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: '카테고리를 찾을 수 없습니다.' });

    const categoryName = row.category;

    db.serialize(() => {
      // inventory 테이블의 해당 category 필드를 NULL로 초기화
      db.run(`UPDATE inventory SET category = NULL WHERE category = ?`, [categoryName], (invErr) => {
        if (invErr) return res.status(500).json({ error: invErr.message });

        // categories 테이블에서 삭제
        db.run(`DELETE FROM categories WHERE id = ?`, [id], (delErr) => {
          if (delErr) return res.status(500).json({ error: delErr.message });

          res.json({ success: true, deletedCategory: categoryName });
        });
      });
    });
  });
};

// 특정 카테고리의 상품 목록 반환
exports.getItemsByCategory = (req, res) => {
  const { category } = req.params;

  const sql = `
    SELECT * FROM inventory
    WHERE category = ?
    ORDER BY 
      CASE WHEN expiry IS NULL OR expiry = '' THEN 1 ELSE 0 END,
      datetime(expiry) ASC
  `;

  db.all(sql, [category], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};
