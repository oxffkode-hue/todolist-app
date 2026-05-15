'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'TOO_MANY_REQUESTS', message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
});

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10kb' }));
app.use(requestLogger);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.status(200).json(successResponse({ message: 'OK' }));
});

// API 라우터 등록
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/todos', todoRouter);
app.use('/api/users', userRouter);

// 존재하지 않는 라우트 처리
app.use((req, res, next) => {
  next(new AppError(404, 'RESOURCE_NOT_FOUND', `Cannot ${req.method} ${req.path}`));
});

app.use(errorHandler);

module.exports = app;
