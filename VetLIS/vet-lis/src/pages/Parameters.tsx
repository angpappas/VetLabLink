import React, { useEffect, useState } from "react";
import { Button, Col, Divider, Form, Input, Modal, Row, Space, Table, message, Popconfirm, PopconfirmProps, Card } from "antd";
import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons";
import { TestParameterSetting } from "../models/TestParameterSettings";
import { ColumnsType } from "antd/es/table";
import useAppDataContext from "../state/AppContext";

const Parameters: React.FC = () => {
    const [parameter, setParameter] = useState<TestParameterSetting[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentParameter, setCurrentParameter] = useState<TestParameterSetting | null>(null);
    const [form] = Form.useForm();
    const context = useAppDataContext();
    const [messageApi, contextHolder] = message.useMessage();

    const columns: ColumnsType<TestParameterSetting> = [
        {
            title: "Name",
            dataIndex: "parameter",
            key: "parameter",
            align: "center",
            ellipsis: true
        },
        {
            title: "Actions",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => editParameter(record)}>
                        <EditFilled />
                    </Button>
                    <Popconfirm
                        title="Delete the parameter"
                        description="Are you sure to delete this parameter?"
                        onConfirm={() => deleteParameter(record.parameter)}
                        onCancel={cancel}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="default" danger>
                            <DeleteFilled />
                        </Button>
                    </Popconfirm>
                </Space>
            ),
            align: "center",
            ellipsis: true
        }
    ];

    const fetchData = async () => {
        const resp = await fetch(`/api/TestParameterSettings/GetAll`);
        const data = await resp.json();
        setParameter(data);
    };

    useEffect(() => {
        fetchData();
        context?.setCurrentPage("parameters");
    }, []);

    const editParameter = (param: TestParameterSetting) => {
        setCurrentParameter(param);
        form.setFieldsValue(param);
        setIsModalOpen(true);
    };

    const deleteParameter = async (parameter: string) => {
        setLoading(true);
        await fetch(`/api/TestParameterSettings/Delete/${parameter}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        setParameter((prev) => prev.filter((param) => param.parameter !== parameter));
        setLoading(false);
    };

    const error = () => {
        messageApi.open({
            type: "error",
            content: "This is an error message"
        });
    };

    const onFinish = async (values: TestParameterSetting) => {
        const method = currentParameter ? "PUT" : "POST";
        const url = currentParameter ? `/api/TestParameterSettings/Put/` : `/api/TestParameterSettings/PostAll`;

        const resp = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values)
        });

        if (resp.ok) {
            fetchData();
            setIsModalOpen(false);
            setCurrentParameter(null);
        } else {
            error();
        }
    };

    const confirm: PopconfirmProps["onConfirm"] = (e) => {
        console.log(e);
        message.success("Click on Yes");
    };

    const cancel: PopconfirmProps["onCancel"] = (e) => {
        console.log(e);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <Card
            title="Parameters"
            extra={
                <Button
                    type="primary"
                    onClick={() => {
                        setCurrentParameter(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                    style={{ float: "right" }}
                >
                    <PlusOutlined /> Add
                </Button>
            }
        >
            <Table columns={columns} rowKey="parameter" dataSource={parameter} loading={loading} pagination={false} />
            <Modal title={currentParameter ? "Edit Parameter" : "Add Parameter"} visible={isModalOpen} onOk={() => form.submit()} onCancel={handleCancel}>
                <Form
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 17 }}
                    initialValues={{
                        remember: true,
                        function: `(() => {
                                        const originalMessage = JSON.parse(\`#msg-str#\`);
                                        return {
	                                        label: ' new label',
	                                        value: 'defaultValue',
	                                        status: 'defaultStatus',
	                                        unit: 'defaultUnit',
	                                        range: 'defaultRange'
                                                };
                                })()`
                    }}
                    autoComplete="off"
                    form={form}
                    onFinish={onFinish}
                >
                    <Form.Item name="parameter" label="Parameter Name" rules={[{ required: true, message: "Please input the parameter name!" }]}>
                        <Input
                            disabled={!!currentParameter?.parameter}
                            style={{
                                color: currentParameter?.parameter ? "rgba(0, 0, 0, 0.85)" : "inherit",
                                backgroundColor: currentParameter?.parameter ? "#f5f5f5" : "inherit",
                                cursor: currentParameter?.parameter ? "not-allowed" : "text",
                                opacity: 1
                            }}
                        />
                    </Form.Item>
                    <Form.Item name="function" label="Function" rules={[{ required: true, message: "Please input the function!" }]}>
                        <Input.TextArea rows={16} />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default Parameters;
