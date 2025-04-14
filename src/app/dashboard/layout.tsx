'use client';

import { useState, useEffect } from 'react';
import { ProLayout } from '@ant-design/pro-components';
import { UserOutlined, FormOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { isLoggedIn, logout } from '../../services/auth';
import api from '../../utils/api';
import Image from 'next/image';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentPathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  const [menuItems, setMenuItems] = useState([
    {
      path: '/dashboard/users',
      name: '用户管理',
      icon: <UserOutlined />,
    },
    {
      path: '/dashboard/questionnaires',
      name: '问卷管理',
      icon: <FormOutlined />,
      children: [],
    },
    {
      path: '/dashboard/assessments',
      name: '答题记录',
      icon: <FileTextOutlined />,
    },
    {
      path: '/dashboard/settings',
      name: '系统设置',
      icon: <SettingOutlined />,
    },
  ]);

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const response: any = await api.get('/admin/assessment-form/list');
        if (response.success && response.data) {
          const questionnaireMenuItems = response.data.map((item: any) => ({
            path: `/dashboard/questionnaires/${item.id}`,
            name: item.name,
          }));

          //使用本地存储存储id和name之间的映射
          localStorage.setItem('questionnaireIdToNameMap', JSON.stringify(response.data.reduce((map:any, item:any) => {
            map[item.id] = item.name;
            return map;
          }, {})));

          setMenuItems(prev =>
            prev.map(item =>
              item.path === '/dashboard/questionnaires'
                ? { ...item, children: questionnaireMenuItems }
                : item
            )
          );
        }
      } catch (error) {
        console.error('获取问卷列表失败:', error);
      }
    };

    fetchQuestionnaires();
  }, []);

  useEffect(() => {
    // 检查登录状态
    if (!isLoggedIn()) {
      router.push('/');
    }
    setMounted(true);
  }, [router]);

  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // 在客户端渲染之前返回一个加载状态或空内容
  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        height: '100vh',
      }}
    >
      <ProLayout
        title="问卷管理系统"
        logo={(
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            priority
          />
        )}
        layout="mix"
        location={{
          pathname: currentPathname,
        }}
        menuProps={{ defaultSelectedKeys: [currentPathname] }}
        menuItemRender={(item:any, dom:any) => (
          <div
            onClick={() => item.path && handleMenuClick(item.path)}
          >
            {dom}
          </div>
        )}
        avatarProps={{
          src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
          size: 'small',
          title: '管理员',
          render: (props:any, dom:any) => {
            return (
              <div onClick={handleLogout} style={{ cursor: 'pointer' }}>
                {dom}
              </div>
            );
          },
        }}
        menuDataRender={() => menuItems}
      >
        {children}
      </ProLayout>
    </div>
  );
}