'use client';

import { useEffect, useRef, useState } from 'react';
import { Typography, Modal, Form, Input, Descriptions } from 'antd';
import { ProCard, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import api from '../../../../utils/api';
import { useParams } from 'next/navigation';
import { getMessage } from '../../../../utils/message';

const { Title } = Typography;

type Question = {
  id: number;
  categoryOne: string;
  categoryTwo: string;
  level: number;
  questionText: string;
};

type QuestionDetail = {
  id: number;
  formName: string;
  categoryOne: string;
  categoryTwo: string;
  level: number;
  questionText: string;
  questionsDetailOptionAndRuleList: {
    optionKey: string;
    optionContent: string;
    optionScore: number;
  }[];
};

export default function QuestionnairePage() {
  const actionRef = useRef<ActionType>(null);
  const params = useParams();
  const formId = params.id;
  const [questionnaireName, setQuestionnaireName] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionDetail, setQuestionDetail] = useState<QuestionDetail | null>(null);
  const [form] = Form.useForm();
  const message = getMessage();

  useEffect(() => {
    const idToNameMap = localStorage.getItem('questionnaireIdToNameMap');
    if (idToNameMap) {
      const nameMap = JSON.parse(idToNameMap);
      setQuestionnaireName(nameMap[formId as string] || '');
    }
  }, [formId]);

  const handleEdit = (record: Question) => {
    setCurrentQuestion(record);
    form.setFieldsValue({
      questionText: record.questionText
    });
    setIsEditModalVisible(true);
  };

  const handleView = async (id: number) => {
    try {
      const response: any = await api.get('/admin/assessment-questions/detail', {
        params: { id }
      });
      if (response.success) {
        setQuestionDetail(response.data);
        setIsDetailModalVisible(true);
      } else {
        message.error(response.message || '获取详情失败');
      }
    } catch (error) {
      console.error('获取题目详情失败:', error);
      message.error('获取详情失败，请重试');
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (currentQuestion) {
        const response: any = await api.post('/admin/assessment-questions/update', {
          id: currentQuestion.id,
          questionText: values.questionText
        });

        if (response.success) {
          message.success('修改成功');
          setIsEditModalVisible(false);
          actionRef.current?.reload();
        } else {
          message.error(response.message || '修改失败');
        }
      }
    } catch (error) {
      console.error('修改题目失败:', error);
      message.error('修改失败，请重试');
    }
  };

  const columns: ProColumns<Question>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '题目内容',
      dataIndex: 'questionText',
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
      search: false
    },
    {
      title: '维度一',
      dataIndex: 'categoryOne',
      copyable: true,
      ellipsis: true,
      valueType: 'text',
      search: {
        transform: (value) => ({ categoryOne: value }),
      },
      align: 'center',
      fieldProps: {
        placeholder: '请输入维度一',
      },
    },
    {
      title: '维度二',
      dataIndex: 'categoryTwo',
      copyable: true,
      ellipsis: true,
      valueType: 'text',
      search: {
        transform: (value) => ({ categoryTwo: value }),
      },
      align: 'center',
      fieldProps: {
        placeholder: '请输入维度二',
      },
    },
    {
      title: '等级',
      dataIndex: 'level',
      valueType: 'select',
      align: 'center',
      valueEnum: {
        1: { text: '1级', status: 'Default' },
        2: { text: '2级', status: 'Processing' },
        3: { text: '3级', status: 'Warning' },
        4: { text: '4级', status: 'Error' },
        5: { text: '5级', status: 'Success' },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => [
        <a key="view" onClick={() => handleView(record.id)}>
          查看
        </a>,
        <a key="edit" onClick={() => handleEdit(record)} style={{ marginLeft: 8 }}>
          修改
        </a>,
      ],
    },
  ];

  return (
    <div className="p-6">
      <ProTable<Question>
        actionRef={actionRef}
        columns={columns}
        request={async (params = {}, sort, filter) => {
          const { current, pageSize, ...restParams } = params;
          const response: any = await api.get('/admin/assessment-questions/list', {
            params: {
              formId: formId,
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
        }}
        headerTitle={questionnaireName || '问卷题目列表'}
        rowKey="id"
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '50'],
        }}
        dateFormatter="string"
        cardBordered
        style={{ backgroundColor: '#fff' }}
        options={{
          setting: true,
          density: true,
          reload: true,
        }}
      />

      <Modal
        title="修改题目"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
      >
        <Form form={form}>
          <Form.Item
            name="questionText"
            label="题目内容"
            rules={[{ required: true, message: '请输入题目内容' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="题目详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {questionDetail && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="表单名称" span={2}>
              {questionDetail.formName}
            </Descriptions.Item>
            <Descriptions.Item label="维度一">
              {questionDetail.categoryOne}
            </Descriptions.Item>
            <Descriptions.Item label="维度二">
              {questionDetail.categoryTwo}
            </Descriptions.Item>
            <Descriptions.Item label="等级">
              {questionDetail.level}
            </Descriptions.Item>
            <Descriptions.Item label="题目内容" span={2}>
              {questionDetail.questionText}
            </Descriptions.Item>
            <Descriptions.Item label="选项和分值" span={2}>
              <div className="space-y-2">
                {questionDetail.questionsDetailOptionAndRuleList.map((option, index) => (
                  <div key={index}>
                    {option.optionKey}. {option.optionContent} （分值：{option.optionScore}）
                  </div>
                ))}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}