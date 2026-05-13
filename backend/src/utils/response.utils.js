'use strict';

/**
 * 성공 응답 객체를 생성한다.
 * @param {*} data - 응답 데이터
 * @param {string} [message] - 선택적 메시지
 * @returns {{ status: string, data: *, message?: string, timestamp: string }}
 */
function successResponse(data, message) {
  const response = {
    status: 'success',
    data,
    timestamp: new Date().toISOString(),
  };

  if (message !== undefined) {
    response.message = message;
  }

  return response;
}

/**
 * 에러 응답 객체를 생성한다.
 * @param {string} code - 에러 코드
 * @param {string} message - 에러 메시지
 * @returns {{ status: string, code: string, message: string, timestamp: string }}
 */
function errorResponse(code, message) {
  return {
    status: 'error',
    code,
    message,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { successResponse, errorResponse };
