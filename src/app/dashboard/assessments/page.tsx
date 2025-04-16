'use client';

import { useRef, useState, useEffect } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Tag, Space, Modal, Table, Descriptions, Form, Input } from 'antd';
import { Line } from '@antv/g2plot';
import { uniq, findIndex } from '@antv/util';
import api from '../../../utils/api';

type AssessmentRecord = {
  id: string;
  childId: string;
  childName: string;
  phone: string;
  formId: string;
  formName: string;
  assessmentDate: string;
  status: string;
  createTime: string;
  updateTime: string;
};

type AssessmentResult = {
  id: string;
  category: string;
  averageScore: number;
  acheiveLevel: number;
  interventionSuggestion: string;
  potentialLevel: string;
  interventionSuggestionLevel: string;
  concernReverse: number;
};

type AssessmentDetail = {
  id: string;
  formName: string;
  chileName: string;
  phone: string;
  status: string;
  createTime: string;
  updateTime: string;
  assessmentResultRespVOList: AssessmentResult[];
};

type CompareData = {
  nowAvgAssessment: { name: string; value: number }[];
  oldAvgAssessment: { name: string; value: number }[];
  nowAssessmentScore: { name: string; value: number }[];
  oldAssessmentScore: { name: string; value: number }[];
};

export default function AssessmentsPage() {
  const actionRef = useRef<ActionType>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detailData, setDetailData] = useState<AssessmentDetail | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentResult, setCurrentResult] = useState<AssessmentResult | null>(null);
  const [form] = Form.useForm();
  const [compareData, setCompareData] = useState<CompareData | null>(null);
  const [isCompareModalVisible, setIsCompareModalVisible] = useState(false);

  const handleCompare = async (type: '1' | '2', id: string) => {
    try {
      const response: any = await api.get('/admin/assessment/compare', {
        params: { id, type }
      });

      if (response.success && response.data) {
        setCompareData(response.data);
        setIsCompareModalVisible(true);
      } else {
        message.error('获取对比数据失败');
      }
    } catch (error) {
      console.error('获取对比数据失败:', error);
      message.error('获取对比数据失败');
    }
  };

  // 存储图表实例的引用
  const avgChartRef = useRef<Line | null>(null);
  const scoreChartRef = useRef<Line | null>(null);

  // 渲染平均评估对比图表
  useEffect(() => {
    let mounted = true;
    
    if (compareData != null && isCompareModalVisible === true) {
      // 销毁之前的图表实例
      if (avgChartRef.current) {
        avgChartRef.current.destroy();
      }
      if (scoreChartRef.current) {
        scoreChartRef.current.destroy();
      }

      // 格式化平均评估数据
      const avgData: any[] = [];
      compareData.nowAvgAssessment.forEach(item => {
        avgData.push({
          category: item.name,
          type: '当前评估',
          value: item.value
        });
      });
      compareData.oldAvgAssessment.forEach(item => {
        avgData.push({
          category: item.name,
          type: '历史评估',
          value: item.value
        });
      });

      // 格式化评估分数数据
      const scoreData: any[] = [];
      compareData.nowAssessmentScore.forEach(item => {
        scoreData.push({
          category: item.name,
          type: '当前评估',
          value: item.value
        });
      });
      compareData.oldAssessmentScore.forEach(item => {
        scoreData.push({
          category: item.name,
          type: '历史评估',
          value: item.value
        });
      });

      // 颜色配置
      const COLOR_PLATE = [
        '#5B8FF9',
        '#5AD8A6',
        '#5D7092',
        '#F6BD16',
        '#E8684A',
        '#6DC8EC',
        '#9270CA',
        '#FF9D4D',
        '#269A99',
        '#FF99C3',
      ];

      // 初始化平均评估对比图表
      setTimeout(() => {
        const avgContainer = document.getElementById('avgAssessmentChart');
        if (avgContainer && avgContainer.children.length === 0 && avgContainer.clientWidth > 0) {
          avgContainer.innerHTML = '';
          const avgChart = new Line(avgContainer, {
            data: avgData,
            xField: 'category',
            yField: 'value',
            seriesField: 'type',
            yAxis: {
              title: {
                text: '平均分值',
              },
              line: {
                style: {
                  stroke: '#ddd',
                  lineWidth: 1,
                },
              },
              tickLine: {
                style: {
                  stroke: '#ddd',
                },
              },
              grid: {
                line: {
                  style: {
                    stroke: '#f0f0f0',
                    lineDash: [4, 4],
                  },
                },
              },
              label: {
                autoHide: true,
                autoRotate: false,
              },
            },
            xAxis: {
              title: {
                text: '评估维度',
              },
              line: {
                style: {
                  stroke: '#ddd',
                  lineWidth: 1,
                },
              },
              tickLine: {
                style: {
                  stroke: '#ddd',
                },
              },
              label: {
                autoHide: true,
                autoRotate: false,
                offset: 10,
              },
              grid: null,
            },
            legend: {
              position: 'top',
            },
            smooth: true,
            animation: {
              appear: {
                animation: 'fade-in',
                duration: 1000,
              },
            },
            color: COLOR_PLATE,
            point: {
              size: 5,
              shape: 'circle',
              style: {
                fill: 'white',
                stroke: '#5B8FF9',
                lineWidth: 2,
              },
            },
          });
          avgChart.render();
          avgChartRef.current = avgChart;
        }
      }, 100);

      // 初始化评估分数对比图表
      setTimeout(() => {
        const scoreContainer = document.getElementById('assessmentScoreChart');
        if (scoreContainer && scoreContainer.children.length === 0 && scoreContainer.clientWidth > 0) {
          scoreContainer.innerHTML = '';
          const scoreChart = new Line(scoreContainer, {
            data: scoreData,
            xField: 'category',
            yField: 'value',
            seriesField: 'type',
            yAxis: {
              title: {
                text: '分数',
              },
              line: {
                style: {
                  stroke: '#ddd',
                  lineWidth: 1,
                },
              },
              tickLine: {
                style: {
                  stroke: '#ddd',
                },
              },
              grid: {
                line: {
                  style: {
                    stroke: '#f0f0f0',
                    lineDash: [4, 4],
                  },
                },
              },
              label: {
                autoHide: true,
                autoRotate: false,
              },
            },
            xAxis: {
              title: {
                text: '评估项目',
              },
              line: {
                style: {
                  stroke: '#ddd',
                  lineWidth: 1,
                },
              },
              tickLine: {
                style: {
                  stroke: '#ddd',
                },
              },
              label: {
                autoHide: true,
                autoRotate: false,
                offset: 10,
              },
              grid: null,
            },
            legend: {
              position: 'top',
            },
            smooth: true,
            animation: {
              appear: {
                animation: 'fade-in',
                duration: 1000,
              },
            },
            color: COLOR_PLATE,
            point: {
              size: 5,
              shape: 'circle',
              style: {
                fill: 'white',
                stroke: '#5AD8A6',
                lineWidth: 2,
              },
            },
          });
          scoreChart.render();
          scoreChartRef.current = scoreChart;
        }
      }, 150);
    }
      return () => {
      mounted = false;
      if (avgChartRef.current) {
        avgChartRef.current.destroy();
        avgChartRef.current = null;
      }
      if (scoreChartRef.current) {
        scoreChartRef.current.destroy();
        scoreChartRef.current = null;
      }
    };
  }, [compareData, isCompareModalVisible]);

  const handleCompareModalClose = () => {
    // 关闭模态框时销毁图表实例
    if (avgChartRef.current) {
      avgChartRef.current.destroy();
      avgChartRef.current = null;
    }
    if (scoreChartRef.current) {
      scoreChartRef.current.destroy();
      scoreChartRef.current = null;
    }
    setIsCompareModalVisible(false);
    setCompareData(null);
  };


  const columns: ProColumns<AssessmentRecord>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    {
      title: '儿童姓名',
      dataIndex: 'childName',
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
      fieldProps: {
        placeholder: '请输入儿童姓名',
      },
      search: {
        transform: (value) => ({ childName: value }),
      },
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      copyable: true,
      ellipsis: true,
      fieldProps: {
        placeholder: '请输入联系电话',
      },
      search: {
        transform: (value) => ({ phone: value }),
      },
    },
    {
      title: '问卷名称',
      dataIndex: 'formName',
      copyable: true,
      ellipsis: true,
      fieldProps: {
        placeholder: '请选择问卷',
      },
      width: 300,
      valueType: 'select',
      request: async () => {
        try {
          const response: any = await api.get('/admin/assessment-form/list');
          if (response.success && response.data) {
            return response.data.map((item: any) => ({
              label: item.name,
              value: item.id,
            }));
          }
          return [];
        } catch (error) {
          console.error('获取问卷列表失败:', error);
          return [];
        }
      },
      search: {
        transform: (value) => ({ formId: value }),
      },
    },
    {
      title: '测评日期',
      dataIndex: 'assessmentDate',
      valueType: 'date',
      sorter: true,
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        '1': {
          text: '已完成',
          status: 'Success',
        },
        '2': {
          text: '部分完成',
          status: 'Processing',
        },
        '0': {
          text: '未开始',
          status: 'Default',
        },
      },
      search: false
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
      valueType: 'dateTimeRange',
      hideInTable: true,
      search: {
        transform: (value) => {
          return {
            queryStartTime: value[0],
            queryEndTime: value[1],
          };
        },
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => [
        <a key="view" onClick={() => handleViewDetail(record.id)}>
          查看详情
        </a>,
        <a key="compare1" onClick={() => handleCompare('1', record.id)} style={{ marginLeft: 8 }}>
          上次比较
        </a>,
        <a key="compare2" onClick={() => handleCompare('2', record.id)} style={{ marginLeft: 8 }}>
          首次比较
        </a>
      ],
    },
  ];

  const handleViewDetail = async (id: string) => {
    try {
      const response: any = await api.get('/admin/assessment/detail', {
        params: { id }
      });

      if (response.success && response.data) {
        setDetailData(response.data);
        setIsModalVisible(true);
      } else {
        message.error('获取答题记录详情失败');
      }
    } catch (error) {
      console.error('获取答题记录详情失败:', error);
      message.error('获取答题记录详情失败');
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleEditSuggestion = (record: AssessmentResult) => {
    setCurrentResult(record);
    form.setFieldsValue({
      interventionSuggestion: record.interventionSuggestion,
      interventionSuggestionLevel: record.interventionSuggestionLevel
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (currentResult) {
        const response: any = await api.post('/admin/assessment/updateInterventionSuggestion', {
          id: currentResult.id,
          interventionSuggestion: values.interventionSuggestion,
          interventionSuggestionLevel: values.interventionSuggestionLevel
        });

        if (response.success) {
          message.success('修改干预建议成功');
          setIsEditModalVisible(false);

          // 刷新详情数据
          if (detailData) {
            const updatedResponse: any = await api.get('/admin/assessment/detail', {
              params: { id: detailData.id }
            });

            if (updatedResponse.success && updatedResponse.data) {
              setDetailData(updatedResponse.data);
            }
          }
        } else {
          message.error(response.message || '修改干预建议失败');
        }
      }
    } catch (error) {
      console.error('修改干预建议失败:', error);
      message.error('修改干预建议失败，请重试');
    }
  };

  // 定义结果表格列
  const resultColumns = [
    {
      title: '维度',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '平均分',
      dataIndex: 'averageScore',
      key: 'averageScore',
    },
    {
      title: '达到等级',
      dataIndex: 'acheiveLevel',
      key: 'acheiveLevel',
    },
    {
      title: '评分等级一：干预建议',
      dataIndex: 'interventionSuggestion',
      key: 'interventionSuggestion',
      ellipsis: true,
    },
    {
      title: '萌芽等级',
      dataIndex: 'potentialLevel',
      key: 'potentialLevel',
    },
    {
      title: '评分等级二：干预建议',
      dataIndex: 'interventionSuggestionLevel',
      key: 'interventionSuggestionLevel',
      ellipsis: true,
    },
    {
      title: '反向选择经常的数量',
      dataIndex: 'concernReverse',
      key: 'concernReverse',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AssessmentResult) => (
        <a onClick={() => handleEditSuggestion(record)}>修改干预建议</a>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Modal
        title="修改干预建议"
        open={isEditModalVisible}
        onCancel={handleEditModalClose}
        onOk={handleEditSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="interventionSuggestion"
            label="评分等级一：干预建议"
            rules={[{ required: true, message: '请输入干预建议' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入干预建议" />
          </Form.Item>
          <Form.Item
            name="interventionSuggestionLevel"
            label="评分等级二：干预建议"
            rules={[{ required: true, message: '请输入干预建议' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入干预建议" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="答题记录详情"
        open={isModalVisible}
        onCancel={handleModalClose}
        width={1000}
        footer={null}
      >
        {detailData && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="问卷名称">{detailData.formName}</Descriptions.Item>
              <Descriptions.Item label="儿童姓名">{detailData.chileName}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{detailData.phone}</Descriptions.Item>
              <Descriptions.Item label="状态">{detailData.status}</Descriptions.Item>
              <Descriptions.Item label="开始答题时间">{detailData.createTime}</Descriptions.Item>
              <Descriptions.Item label="修改时间">{detailData.updateTime.replace("T"," ")}</Descriptions.Item>
            </Descriptions>

            <h3 className="mt-4 mb-2">答题结果</h3>
            <Table
              dataSource={detailData.assessmentResultRespVOList}
              columns={resultColumns}
              rowKey="id"
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </div>
        )}
      </Modal>

      <Modal
        title="答题对比"
        open={isCompareModalVisible && !!compareData}
        onCancel={handleCompareModalClose}
        width={1000}
        footer={null}
      >
        {compareData && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">平均评估对比</h3>
              <div 
                id="avgAssessmentChart" 
                style={{
                  width: '100%',
                  height: 400,
                }}
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">评估分数对比</h3>
              <div 
                id="assessmentScoreChart" 
                style={{
                  width: '100%',
                  height: 400,
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      <ProTable<AssessmentRecord>
        actionRef={actionRef}
        columns={columns}
        request={async (params = {}, sort, filter) => {
          const { current, pageSize, ...restParams } = params;
          try {
            const response: any = await api.get('/admin/assessment/list', {
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
            console.error('获取答题记录列表失败:', error);
            message.error('获取答题记录列表失败');
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        headerTitle="答题记录列表"
        rowKey="id"
        search={{
          labelWidth: 120,
          defaultCollapsed: false,
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        dateFormatter="string"
        toolBarRender={() => []}
      />
    </div>
  );
}