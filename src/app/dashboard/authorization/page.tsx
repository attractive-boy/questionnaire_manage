'use client'
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Input, Space, Tag, Modal, Form, Select } from 'antd';
import { useRef, useState } from 'react';
import api from '../../../utils/api';
import { getMessage } from '../../../utils/message';

type ManagerUserItem = {
  id: string;
  username: string;
  name: string;
  role: string;
  createTime: string;
};

export default () => {
  const actionRef = useRef<ActionType>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const message = getMessage();
  
  const columns: ProColumns<ManagerUserItem>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      copyable: true,
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    },
    {
      title: '姓名',
      dataIndex: 'name',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      ellipsis: true,
      render: (_, record) => (
        <Tag color={record.role === 'admin' ? 'blue' : 'green'}>
          {record.role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => [,
        <a key="delete" style={{ color: '#ff4d4f', marginLeft: 8 }} onClick={() => showDeleteConfirm(record.id)}>
          删除
        </a>,
      ],
    },
  ];

  const showDeleteConfirm = (userId: string) => {
    setUserIdToDelete(userId);
    setIsDeleteConfirmVisible(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response: any = await api.get('/manager/user/delete', {
        params: { userId }
      });
      if (response.success) {
        message.success('用户已删除');
        actionRef.current?.reload();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('删除失败，请重试');
    }
  };

  return (
    <>
    <div className="p-6">
      <ProTable<ManagerUserItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}, sort, filter) => {
          console.log(params, sort, filter);
          const { current, pageSize, username, ...rest } = params;
          
          try {
            const response: any = await api.get('/manager/user/list', {
              params: {
                page: current || 1,
                size: pageSize || 10,
                username,
                ...rest,
              },
            });
            
            return {
              data: response.data || [],
              success: response.success,
              total: response.total || 0,
            };
          } catch (error) {
            console.error('获取用户列表失败:', error);
            message.error('获取用户列表失败，请重试');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        editable={{
          type: 'multiple',
        }}
        columnsState={{
          persistenceKey: 'manager-user-table',
          persistenceType: 'localStorage',
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        form={{
          syncToUrl: (values, type) => {
            if (type === 'get') {
              return {
                ...values,
                created_at: [values.startTime, values.endTime],
              };
            }
            return values;
          },
        }}
        pagination={{
          pageSize: 10,
          onChange: (page) => console.log(page),
        }}
        dateFormatter="string"
        headerTitle="授权管理"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<UserOutlined />}
            type="primary"
            onClick={() => {
              form.resetFields();
              setIsModalVisible(true);
            }}
          >
            新建用户
          </Button>,
        ]}
      />
    </div>
    
    <Modal
      title="新建用户"
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={async (values) => {
          try {
            setLoading(true);
            const response: any = await api.post('/manager/user/create-user', {
              username: values.username,
              password: values.password,
              name: values.name,
              role: values.role
            });
            
            if (response.success) {
              message.success('用户创建成功');
              setIsModalVisible(false);
              actionRef.current?.reload();
            } else {
              message.error(response.message || '创建失败');
            }
          } catch (error) {
            console.error('创建用户失败:', error);
            message.error('创建用户失败，请重试');
          } finally {
            setLoading(false);
          }
        }}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
        </Form.Item>
        
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>
        
        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
        </Form.Item>
        
        <Form.Item
          name="role"
          label="角色"
          rules={[{ required: true, message: '请选择角色' }]}
          initialValue="user"
        >
          <Select>
            <Select.Option value="admin">管理员</Select.Option>
            <Select.Option value="user">普通用户</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>

    <Modal
      title="确认删除"
      open={isDeleteConfirmVisible}
      onOk={() => {
        if (userIdToDelete) {
          handleDeleteUser(userIdToDelete);
          setIsDeleteConfirmVisible(false);
        }
      }}
      onCancel={() => setIsDeleteConfirmVisible(false)}
      okText="确认"
      cancelText="取消"
    >
      <p>确定要删除此用户吗？此操作不可恢复。</p>
    </Modal>
    </>
  );
};