'use client';

import { message } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';

let messageApi: MessageInstance | null = null;

export const setMessageApi = (api: MessageInstance) => {
  messageApi = api;
};

export const getMessage = () => {
  if (messageApi) {
    return messageApi;
  }
  return message;
}; 