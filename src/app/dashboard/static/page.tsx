"use client";
import api from "@/utils/api";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { Form, Input, Modal } from "antd";
import { useRef, useState } from "react";

type StaticConfig = {
  staticId: string;
  staticName: string;
  content: string;
};

export default function StaticConfig() {
  const actionRef = useRef<ActionType>(null);
  const [staticRecord, setStaticRecord] = useState<StaticConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const updateStatic = (record: StaticConfig) => {
    form.setFieldsValue({
      staticName: record.staticName,
      content: record.content,
    });
    setStaticRecord(record);
    setVisible(true);
  };
  const columns: ProColumns<StaticConfig>[] = [
    {
      dataIndex: "index",
      valueType: "indexBorder",
      width: 48,
    },
    {
      title: "静态值名称",
      dataIndex: "staticName",
      key: "staticName",
    },
    {
      title: "内容",
      dataIndex: "content",
      key: "content",
      copyable: true,
      ellipsis: true,
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      render: (_, record) => [
        <a key="view" onClick={() => updateStatic(record)}>
          修改
        </a>,
      ],
    },
  ];

  const onOk = async () => {
    const value = await form.validateFields();
    await api.post("/static/update", {
      ...value,
      staticId: staticRecord?.staticId,
    });
  };
  return (
    <>
      <ProTable<StaticConfig>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}, sort, filter) => {
          const { current, pageSize, createTime, ...restParams } = params;
          try {
            const response: any = await api.get("/static/list", {
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
            console.error("获取用户列表失败:", error);
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        editable={{
          type: "multiple",
        }}
        rowKey="staticId"
        search={{
          labelWidth: "auto",
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
        headerTitle="静态值配置"
      />
      <Modal
        title="修改静态数据"
        open={visible}
        onOk={onOk}
        onCancel={() => setVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form}>
          <Form.Item label="静态值名称" name="staticName" required>
            <Input />
          </Form.Item>
          <Form.Item label="静态值内容" name="content" required>
            <Input.TextArea></Input.TextArea>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
