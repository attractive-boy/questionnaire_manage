'use client';

import { App as AntdApp } from 'antd';

export default function AntdAppProvider({ children }: { children: React.ReactNode }) {
  return <AntdApp>{children}</AntdApp>;
} 