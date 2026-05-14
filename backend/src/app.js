'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require(path.join(__dirname, '../../swagger/swagger.json'));
const config = require('./config/env.config');
const { successResponse } = require('./utils/response.utils');
const { AppError } = require('./errors/AppError');
const { requestLogger } = require('./middlewares/requestLogger');
const { errorHandler } = require('./middlewares/errorHandler');

const authRouter = require('./routes/authRouter');
const categoryRouter = require('./routes/categoryRouter');
const todoRouter = require('./routes/todoRouter');
const userRouter = require('./routes/userRouter');

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(requestLogger);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.status(200).json(successResponse({ message: 'OK' }));
});

// API 라우터 등록
app.use('/api/auth', authRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/todos', todoRouter);
app.use('/api/users', userRouter);

// 존재하지 않는 라우트 처리
app.use((req, res, next) => {
  next(new AppError(404, 'RESOURCE_NOT_FOUND', `Cannot ${req.method} ${req.path}`));
});

app.use(errorHandler);

module.exports = app;
