import React from 'react';
import './StatusMessage.css';

const StatusMessage = ({ type, message }) => {
  return (
    <div className={`status-message ${type}`}>
      <pre>{message}</pre>
    </div>
  );
};

export default StatusMessage;
