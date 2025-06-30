// utils/socketError.js
export const emitSocketError = (socketOrCb, errorObj) => {
  const payload = {
    success: false,
    code: errorObj.code || 500,
    message: errorObj.message || 'Unknown socket error'
  };

  if (typeof socketOrCb === 'function') {
    socketOrCb(payload);
  } else {
    socketOrCb.emit('error', payload);
  }
};
