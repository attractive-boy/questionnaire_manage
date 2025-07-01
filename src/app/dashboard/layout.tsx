"use client";

import { useState, useEffect } from "react";
import { ProLayout } from "@ant-design/pro-components";
import {
  UserOutlined,
  FormOutlined,
  SettingOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  PicRightOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn, logout } from "../../services/auth";
import api from "../../utils/api";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const currentPathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  // 定义所有可能的菜单项
  const allMenuItems = [
    {
      path: "/dashboard/users",
      name: "用户管理",
      icon: <UserOutlined />,
    },
    {
      path: "/dashboard/questionnaires",
      name: "问卷管理",
      icon: <FormOutlined />,
      children: [],
    },
    {
      path: "/dashboard/assessments",
      name: "答题记录",
      icon: <FileTextOutlined />,
    },
    {
      path: "/dashboard/templates",
      name: "模板库管理",
      icon: <DatabaseOutlined />,
    },
    {
      path: "/dashboard/authorization",
      name: "授权管理",
      icon: <SettingOutlined />,
    },
    {
      path: "/dashboard/static",
      name: "静态值配置",
      icon: <PicRightOutlined />,
    },
  ];

  // 根据用户角色过滤菜单项
  const [menuItems, setMenuItems] = useState<any[]>([]);

  // 根据用户角色和问卷列表更新菜单
  useEffect(() => {
    // 根据用户角色过滤菜单项
    let filteredItems = [];

    if (userRole === "admin") {
      // 管理员可以看到所有菜单
      filteredItems = [...allMenuItems];
    } else {
      // 普通用户只能看到用户管理和答题记录
      filteredItems = allMenuItems.filter(
        (item) =>
          item.path === "/dashboard/users" ||
          item.path === "/dashboard/assessments"
      );
    }

    setMenuItems(filteredItems);
  }, [userRole]);

  // 获取问卷列表并更新菜单
  useEffect(() => {
    // 只有管理员需要加载问卷列表
    if (userRole !== "admin") return;

    const fetchQuestionnaires = async () => {
      try {
        const response: any = await api.get("/admin/assessment-form/list");
        if (response.success && response.data) {
          const questionnaireMenuItems = response.data.map((item: any) => ({
            path: `/dashboard/questionnaires/${item.id}`,
            name: item.name,
          }));

          //使用本地存储存储id和name之间的映射
          localStorage.setItem(
            "questionnaireIdToNameMap",
            JSON.stringify(
              response.data.reduce((map: any, item: any) => {
                map[item.id] = item.name;
                return map;
              }, {})
            )
          );

          setMenuItems((prev) =>
            prev.map((item) =>
              item.path === "/dashboard/questionnaires"
                ? { ...item, children: questionnaireMenuItems }
                : item
            )
          );
        }
      } catch (error) {
        console.error("获取问卷列表失败:", error);
      }
    };

    fetchQuestionnaires();
  }, [userRole]);

  useEffect(() => {
    // 检查登录状态
    if (!isLoggedIn()) {
      router.push("/");
      return;
    }

    // 获取当前用户信息
    const fetchUserInfo = async () => {
      try {
        const response: any = await api.get("/manager/user/query-by-user-id");
        if (response.success && response.data) {
          setUserRole(response.data.role);
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    };

    fetchUserInfo();
    setMounted(true);
  }, [router]);

  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // 在客户端渲染之前返回一个加载状态或空内容
  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      <ProLayout
        title="星跃孤独症儿童干预测评管理系统"
        logo={
          <Image src="/logo.png" alt="Logo" width={32} height={32} priority />
        }
        layout="mix"
        location={{
          pathname: currentPathname,
        }}
        menuProps={{ defaultSelectedKeys: [currentPathname] }}
        menuItemRender={(item: any, dom: any) => (
          <div onClick={() => item.path && handleMenuClick(item.path)}>
            {dom}
          </div>
        )}
        avatarProps={{
          src: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
          size: "small",
          title: "管理员",
          render: (props: any, dom: any) => {
            return (
              <div onClick={handleLogout} style={{ cursor: "pointer" }}>
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
