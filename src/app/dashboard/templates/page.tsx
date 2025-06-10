'use client';

import { useRef, useState } from 'react';
import { message, Modal, Form, Input, Typography } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import api from '../../../utils/api';
import { getMessage } from '../../../utils/message';

type Template = {
  id: string;
  code: string;
  templateDesc: string;
  templateText: string;
};

export default function TemplatesPage() {
  const actionRef = useRef<ActionType>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [form] = Form.useForm();
  const message = getMessage();

  const columns: ProColumns<Template>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '模板编码',
      dataIndex: 'code',
      copyable: true,
      ellipsis: true,
      search: {
        transform: (value) => ({ code: value }),
      },
    },
    {
      title: '模板说明',
      dataIndex: 'templateDesc',
      copyable: true,
      ellipsis: true,
      search: {
        transform: (value) => ({ templateDesc: value }),
      },
    },
    {
      title: '模板内容',
      dataIndex: 'templateText',
      ellipsis: true,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentTemplate(record);
            form.setFieldsValue({
              templateText: record.templateText
            });
            setIsModalVisible(true);
          }}
        >
          更新
        </a>,
      ],
    },
  ];

  return (
    <div className="p-6">
      <ProTable<Template>
        actionRef={actionRef}
        columns={columns}
        request={async (params = {}) => {
          const { current, pageSize, ...restParams } = params;
          try {
            const response: any = await api.get('/admin/assessment-template/list', {
              params: {
                page: current,
                size: pageSize,
                ...restParams,
              },
            });
            return {
              data: response.data || [],
              success: response.success,
              total: response.total || 0,
            };
          } catch (error) {
            console.error('获取模板列表失败:', error);
            message.error('获取列表失败，请重试');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        headerTitle="模板库管理"
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          defaultPageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        dateFormatter="string"
        options={{
          density: true,
          fullScreen: true,
          reload: true,
          setting: true,
        }}
      />
      <Modal
        title="编辑模板"
        open={isModalVisible}
        onOk={async () => {
          try {
            const values = await form.validateFields();
            if (currentTemplate) {
              const response: any = await api.post('/admin/assessment-template/update-template', {
                id: currentTemplate.id,
                templateText: values.templateText,
              });
              if (response.success) {
                message.success('更新成功');
                setIsModalVisible(false);
                actionRef.current?.reload();
              } else {
                message.error(response.message || '更新失败');
              }
            }
          } catch (error) {
            console.error('更新模板失败:', error);
            message.error('更新失败，请重试');
          }
        }}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="templateText"
            label="模板内容"
            rules={[{ required: true, message: '请输入模板内容' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Typography.Text type="danger" style={{ fontSize: '12px' }}>
            注：{'{}'} 为数据占位符，生成干预建议的时候会替换为实际数值。此符号在模板内容的位置不可变，否则干预建议将混乱。
          </Typography.Text>
        </Form>
      </Modal>
    </div>
  );
}