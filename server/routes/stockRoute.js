const express = require('express');
const router = express.Router();
const controller = require('../controllers/stockController');

router.get('/batches/:name', controller.getBatchesByName);
router.patch('/batch/:id', controller.updateBatch);
router.put('/updateTotalQuantityByName/:name',controller.updateTotalQuantityByName); // 상품명으로 total 업데이트 하기.
router.get('/disposal', controller.getDiscard);        // 폐기 예정 조회

router.get('/', controller.getAll);                     // 전체 재고 목록 조회
//router.get('/barcode/:barcode', controller.getDetailByBarcode); // 바코드 조회
router.post('/', controller.postStock);                // 재고 추가/입고
router.patch('/:id', controller.update);               // 수정
router.delete('/:id', controller.remove);              // 삭제

router.get('/:id', controller.getDetail);               // ID로 상세 조회 (배치별)





module.exports = router;
