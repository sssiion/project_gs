const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const fs = require('fs');
const open = require('open').default;

const app = express();
const PORT = 3000;

app.use(cors()); // CORS 허용
app.use(express.static(__dirname)); // 정적 파일 서비스

const upload = multer({ dest: 'uploads/' }); // 파일 임시 저장 폴더

let parsedData = []; // 파싱된 엑셀 데이터를 저장할 전역 변수

// ✅ Excel 업로드 및 파싱
app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;

  try {
    const workbook = XLSX.readFile(filePath); // 업로드된 파일 읽기
    const sheet = workbook.Sheets['sheet2'];  // Sheet2 읽기

    if (!sheet) throw new Error('❌ "Sheet2" 시트를 찾을 수 없습니다.');

    // Sheet2를 행(row) 배열로 읽어오기
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    console.log('📊 rows 샘플 (최대 5줄):');
    console.table(rows.slice(0, 5));

    parsedData = []; // 기존 데이터 초기화

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const code = row[0];     // A열: 상품코드
      const name = row[1];     // B열: 상품명
      const quantity = row[5]; // F열: 재고 수량

      // 헤더 줄 혹은 유효하지 않은 값은 건너뜀
      if (
        code === '상품코드' || name === '상품명' ||
        typeof code !== 'string' && typeof code !== 'number'
      ) {
        continue;
      }

      if (code && name) {
        parsedData.push({ code, name, quantity });
      }
    }

    console.log('✅ Sheet2 파싱 완료:', parsedData.slice(0, 3)); // 일부 출력

    fs.unlinkSync(filePath); // 임시 업로드 파일 삭제
    res.send({ message: '파일 업로드 및 파싱 성공', count: parsedData.length });

  } catch (err) {
    console.error('❌ 엑셀 파싱 실패:', err.message);
    res.status(500).send({ error: '엑셀 처리 실패' });
  }
});

// ✅ React Native 앱에서 사용할 데이터 API
app.get('/data', (req, res) => {
  try {
    res.json(parsedData);
  } catch (err) {
    console.error('❌ 데이터 응답 실패:', err);
    res.status(500).send({ error: '데이터 응답 실패' });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
  console.log('📤 POST /upload - 엑셀 업로드');
  console.log('📥 GET /data   - React Native 앱용 데이터 조회');
  open(`http://localhost:${PORT}/upload.html`); // 웹페이지 자동 열기
});
