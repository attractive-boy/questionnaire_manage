'use client';

import { useEffect } from 'react';
import { App as AntdApp } from 'antd';
import { setMessageApi } from '../utils/message';

export default function AntdAppWrapper({ children }: { children: React.ReactNode }) {
  const { message } = AntdApp.useApp();
  
  useEffect(() => {
    setMessageApi(message);
  }, [message]);
  
  return <>{children}</>;
} 