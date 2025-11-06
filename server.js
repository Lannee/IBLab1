require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const { initializeDatabase } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Базовые меры безопасности
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Инициализация базы данных
initializeDatabase();

// Маршруты
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Обработка несуществующих маршрутов
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Глобальный обработчик ошибок
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;