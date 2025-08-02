const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');

router.post('/', controller.create); // 카테고리 생성
router.get('/', controller.getAll); // 카테고리 조회
router.patch('/:id', controller.update); // 카테고리 수정
router.delete('/:id', controller.remove); // 카테고리 삭제
router.get('/:category/items', controller.getItemsByCategory); //카테고리 별 상품 반환
router.get('/category_Type/:categoryType', controller.getByCategoryType);

module.exports = router;