"use client"
import { EllipsisOutlined, PlusOutlined,EyeOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable, TableDropdown } from '@ant-design/pro-components';
import { Button, Dropdown, Space, Modal, message, Descriptions,Tag,Image } from 'antd';
import { useRef, useState } from 'react';
import api from '../../../utils/api';

type UserItem = {
  id: string;
  phone: string;
  name: string;
  ageGroup: string;
  processStatus: string;
  profilePath: string;
  createTime: string;
};



export default () => {
  const actionRef = useRef<ActionType>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<string | null>(null);
  const [tempCode, setTempCode] = useState<string | null>(null);
  const [isBanConfirmVisible, setIsBanConfirmVisible] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [isUnbanConfirmVisible, setIsUnbanConfirmVisible] = useState(false);
  const [userIdToUnban, setUserIdToUnban] = useState<string | null>(null);
  
  const columns: ProColumns<UserItem>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '姓名',
      dataIndex: 'name',
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
      title: '手机号',
      dataIndex: 'phone',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '年龄段',
      dataIndex: 'ageGroup',
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: '3-7岁',
        },
        2: {
          text: '7-12岁',
        },
      },
      fieldProps: {
        options: [
          { label: '3-7岁', value: '1' },
          { label: '7-12岁', value: '2' },
        ],
      },
    },
    {
      title: '处理状态',
      dataIndex: 'processStatus',
      valueType: 'select',
      valueEnum: {
        0: {
          text: '审批通过',
          status: 'Success',
        },
        1: {
          text: '资料未提交',
          status: 'Default',
        },
        2: {
          text: '资料已提交，尚未审批',
          status: 'Processing',
        },
        3: {
          text: '资料审批不通过',
          status: 'Error',
        },
        4: {
          text: '封号',
          status: 'Error',
        },
      },
    },
    {
      title: '诊断书',
      dataIndex: 'profilePath',
      search: false,
      render: (_, record) => (
        record.profilePath ? (
          <a onClick={async () => {
            try {
              const response: any = await api.get('/admin/user/generateTempCode', {
                params: { userId: record.id }
              });
              if (response.success && response.data) {
                setTempCode(response.data);
                setIsProfileModalVisible(true);
              }
            } catch (error) {
              console.error('获取临时编码失败:', error);
            }
          }}>
            查看诊断书
          </a>
        ) : '-'
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTimeRange',
      valueType: 'dateTimeRange',
      search: {
        transform: (value) => {
          return {
            createTimeStart: value[0],
            createTimeEnd: value[1],
          };
        },
      },
      sorter: false,
      hideInSearch: false,
      hideInTable: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => [
         <a
          key="view"
          onClick={() => handleViewDetail(record.id)}
        >
         { record.processStatus === '2' ? '审批': '查看' }
        </a>,
        record.processStatus === '4' ? (
          <a
            key="unban"
            style={{ color: '#52c41a', marginLeft: 8 }}
            onClick={() => showUnbanConfirm(record.id)}
          >
            解封
          </a>
        ) : record.processStatus !== '4' && (
          <a
            key="ban"
            style={{ color: '#ff4d4f', marginLeft: 8 }}
            onClick={() => showBanConfirm(record.id)}
          >
            封禁
          </a>
        )
      ],
    },
  ];

  const handleViewDetail = async (userId: string) => {
    try {
      const response: any = await api.get('/admin/user/detail', {
        params: { userId }
      });
      
      // if (response.success) {
        setCurrentUser(response);
        //调用请求获取临时code
        const response2: any = await api.get('/admin/user/generateTempCode', {
          params: { userId }
        });

        setTempCode(response2.data);

        setIsModalVisible(true);
      // }
    } catch (error) {
      console.error('获取用户详情失败:', error);
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      const response: any = await api.get('/admin/user/banUser', {
        params: { userId }
      });
      if (response.success) {
        message.success('用户已封禁');
        actionRef.current?.reload();
      } else {
        message.error(response.message || '封禁失败');
      }
    } catch (error) {
      console.error('封禁用户失败:', error);
      message.error('封禁失败');
    }
  };

  const showBanConfirm = (userId: string) => {
    setUserIdToDelete(userId);
    setIsBanConfirmVisible(true);
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const response: any = await api.get('/admin/user/unBanUser', {
        params: { userId }
      });
      if (response.success) {
        message.success('用户已解封');
        actionRef.current?.reload();
      } else {
        message.error(response.message || '解封失败');
      }
    } catch (error) {
      console.error('解封用户失败:', error);
      message.error('解封失败');
    }
  };

  const showUnbanConfirm = (userId: string) => {
    setUserIdToUnban(userId);
    setIsUnbanConfirmVisible(true);
  };

  return (
    <>
      <ProTable<UserItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}, sort, filter) => {
          const { current, pageSize, createTime, ...restParams } = params;
          try {
            const response: any = await api.get('/admin/user/list', {
              params: {
                page: current || 1,
                size: pageSize || 10,
                ...restParams,
              },
            });
            
            return {
              data: response.data || [],
              success: response.success,
              total: response.total || 0,
            };
          } catch (error) {
            console.error('获取用户列表失败:', error);
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
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        options={{
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          pageSize: 10,
          onChange: (page) => console.log(page),
        }}
        dateFormatter="string"
        headerTitle="用户列表"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              actionRef.current?.reload();
            }}
            type="primary"
          >
            新建
          </Button>,
          // <Dropdown
          //   key="menu"
          //   menu={{
          //     items: [
          //       {
          //         label: '批量导入',
          //         key: 'import',
          //       },
          //       {
          //         label: '导出数据',
          //         key: 'export',
          //       },
          //     ],
          //   }}
          // >
          //   <Button>
          //     <EllipsisOutlined />
          //   </Button>
          // </Dropdown>,
        ]}
      />
      <Modal
        title="用户详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={currentUser?.processStatus === '2' ? [
          <Button
            key="approve"
            type="primary"
            onClick={async () => {
              try {
                const response: any = await api.post('/admin/user/approveDiagnosisBook', {
                  userId: currentUser.id,
                  approveStatus: '0'
                });
                if (response.success) {
                  message.success('审批通过成功');
                  setIsModalVisible(false);
                  actionRef.current?.reload();
                }
              } catch (error) {
                console.error('审批失败:', error);
                message.error('审批失败');
              }
            }}
          >
            通过
          </Button>,
          <Button
            key="reject"
            danger
            onClick={async () => {
              try {
                const response:any = await api.post('/admin/user/approveDiagnosisBook', {
                  userId: currentUser.id,
                  approveStatus: '3'
                });
                if (response.success) {
                  message.success('审批不通过成功');
                  setIsModalVisible(false);
                  actionRef.current?.reload();
                }
              } catch (error) {
                console.error('审批失败:', error);
                message.error('审批失败');
              }
            }}
          >
            不通过
          </Button>
        ] : null}
        width={800}
      >
        {currentUser && (
          <>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="姓名" span={1}>{currentUser.name}</Descriptions.Item>
              <Descriptions.Item label="手机号" span={1}>{currentUser.phone}</Descriptions.Item>
              <Descriptions.Item label="年龄段" span={1}>
                {currentUser.ageGroup === '1' ? '3-7岁' : 
                 currentUser.ageGroup === '2' ? '7-12岁' : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="处理状态" span={1}>
                <Space>
                  {{
                    '0': <Tag color="success">审批通过</Tag>,
                    '1': <Tag>资料未提交</Tag>,
                    '2': <Tag color="processing">资料已提交，尚未审批</Tag>,
                    '3': <Tag color="error">资料审批不通过</Tag>,
                    '4': <Tag color="error">封号</Tag>
                  }[currentUser.processStatus] || '-'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>{currentUser.createTime}</Descriptions.Item>
              {currentUser.profilePath && (
                <Descriptions.Item label="诊断书" span={2}>
                  <div style={{ marginTop: '10px' }}>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/user/diagnosisBook/${tempCode}`}
                      alt="诊断书预览"
                      style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                      preview={{
                        mask: <div><EyeOutlined /> 点击查看大图</div>
                      }}
                    />
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}
      </Modal>
      <Modal
        title="诊断书"
        open={isProfileModalVisible}
        onCancel={() => {
          setIsProfileModalVisible(false);
          setTempCode(null);
        }}
        footer={null}
        width={800}
      >
        {tempCode && (
          <img
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/user/diagnosisBook/${tempCode}`}
            style={{ width: '100%', maxHeight: '600px' }}
            
            alt="诊断书预览"
          />
        )}
      </Modal>
      <Modal
        title="确认封禁"
        open={isBanConfirmVisible}
        onCancel={() => setIsBanConfirmVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsBanConfirmVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            onClick={() => {
              if (userIdToDelete) {
                handleBanUser(userIdToDelete);
                setIsBanConfirmVisible(false);
              }
            }}
          >
            确认
          </Button>,
        ]}
      >
        <p>确定要封禁该用户吗？封禁后用户将无法使用系统。</p>
      </Modal>
      <Modal
        title="确认解封"
        open={isUnbanConfirmVisible}
        onCancel={() => setIsUnbanConfirmVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsUnbanConfirmVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              if (userIdToUnban) {
                handleUnbanUser(userIdToUnban);
                setIsUnbanConfirmVisible(false);
              }
            }}
          >
            确认
          </Button>,
        ]}
      >
        <p>确定要解封该用户吗？解封后用户将恢复正常使用系统。</p>
      </Modal>
    </>
  );
};