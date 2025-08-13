const express = require('express');
const cors = require('cors');
const path = require('path');
const open = require('open').default;

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 통합 라우터 연결
const stockRoutes = require('./routes/stockRoute');
const categoryRoutes = require('./routes/categoryRoute');
const uploadRoutes = require('./routes/uploadRoute');

app.use('/api/stock', stockRoutes);        
app.use('/api/categories', categoryRoutes);
app.use('/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'upload.html'));
});

app.listen(PORT, () => {
  console.log(`✅ 서버 실행: http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
});
