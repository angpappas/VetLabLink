import React, { useEffect, useRef, useState } from "react";
import useAppDataContext from "../state/AppContext";
import { Alert, Button, Card, Col, Divider, Form, Input, Modal, Radio, Row, Space, Table } from "antd";
import { useForm } from "antd/es/form/Form";
import { CheckCircleOutlined, DeleteFilled, PlusOutlined } from "@ant-design/icons";
import { Analyzer } from "../models/Analyzers";
import { ErrorMessage } from "../models/ErrorMessage";
import { ColumnsType } from "antd/es/table";
import FormItemLabel from "antd/es/form/FormItemLabel";

const Communication: React.FC = (props) => {
    const context = useAppDataContext();
    const [portForm] = useForm();
    const [analyzerForm] = useForm();
    const [alertVisible, setAlertVisible] = useState({
        isOpen: false,
        message: "",
        mode: "",
        settings: ""
    });
    const portRef = useRef(0);
    const [analyzers, setAnalyzers] = useState<Analyzer[]>([]);
    const [statusError, setStatusError] = useState<ErrorMessage | null>(null);
    const [connected, setConnected] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pcIp, setPcIp] = useState("");
    const [serverLog, setServerLog] = useState("");
    const [serverLogOpen, setServerLogOpen] = useState(false);

    type FieldType = {
        hl7Port: number;
    };

    const columns: ColumnsType<Analyzer> = [
        {
            title: "",
            render: () => {
                return <>{connected && <CheckCircleOutlined style={{ color: "green" }} />}</>;
            }
        },
        {
            title: "Application name",
            dataIndex: "applicationType",
            render: (record: any) => {
                switch (record) {
                    case 50:
                        return "Seamaty SMT-120V";
                    case 40:
                        return "Woodley Insight V3 Plus";
                    case 20:
                        return "Genrui VH30";
                    case 30:
                        return "Celercare V Insight V-Chem";
                    case 10:
                        return "DH56 Woodley Insight V IA Plus";
                }
            }
        },
        {
            title: "IP address",
            dataIndex: "ip"
        },
        {
            title: "Settings",
            dataIndex: "settings"
        },
        {
            title: "Action",
            key: "action",
            width: "120px",
            render: (_: any, record: { id: any }, i: any) => (
                <Space size="middle">
                    <Button type="default" onClick={() => deleteAnalyzer(record.id)} danger>
                        <DeleteFilled />
                    </Button>
                </Space>
            )
        }
    ];

    const showModal = () => {
        setIsModalOpen(true);
    };

    const submitNewAnalyzer = async (values: any) => {
        const resp = await fetch(`/api/Analyzers/AddAnalyzer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                applicationType: values.applicationType,
                ip: values.ip,
                settings: values.settings
            })
        });

        if (resp.status !== 200) {
            setAlertVisible({
                isOpen: true,
                message: "Form submission failed!",
                mode: "error",
                settings: "equip"
            });

            return;
        }

        const current = [...analyzers];
        current.push(await resp.json());
        context?.setAnalyzers(current);
        analyzerForm.resetFields();
        setIsModalOpen(false);
    };

    const submitAnalyzerFailed = (errorInfo: any) => {
        analyzerForm.resetFields();
        setIsModalOpen(false);
        setAlertVisible({
            isOpen: true,
            message: "Form submission failed!",
            mode: "error",
            settings: "equip"
        });
    };

    const handleCancel = () => {
        analyzerForm.resetFields();
        setIsModalOpen(false);
    };

    const handleCloseAlert = () => {
        setAlertVisible({ isOpen: false, message: "", mode: "", settings: "" });
    };

    const deleteAnalyzer = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this analyzer?")) {
            return;
        }

        setLoading(true);
        try {
            const resp = await fetch(`/api/Analyzers/Delete/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            if (resp.status !== 200) {
                const errorMessage = await resp.text();
                setStatusError({ status: resp.status, message: errorMessage });
            }

            if (analyzers) {
                context?.setAnalyzers((prv) => {
                    if (!prv) {
                        return prv;
                    }

                    prv = prv.filter((item) => item.id !== id);
                    return prv;
                });
            }
        } catch {
            setStatusError({ status: 0, message: "Connection failed" });
        }

        setLoading(false);
    };

    const onSettingsFinish = async (value: any) => {
        setLoading(true);
        await fetch(`api/Settings/Communication`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                hl7Port: value.hl7Port
            })
        });

        context?.fetchSettings();
        setLoading(false);
    };

    const onSettingsFinishFailed = (errorInfo: any) => {
        setAlertVisible({
            isOpen: true,
            message: "Form Submission failed!",
            mode: "error",
            settings: "comm"
        });
    };

    useEffect(() => {
        context?.setCurrentPage("communication");
        const fetchServerLog = async () => {
            const response = await fetch("/api/Settings/ServerLog");
            setServerLog((await response.json()).log);
        };

        const intervalId = setInterval(fetchServerLog, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (context?.settings && context?.settings.hl7Port !== undefined && context.settings.hl7Port !== 0) {
            portRef.current = context?.settings.hl7Port;
            setPcIp(context.settings.ip);
            portForm.setFieldsValue({ hl7Port: portRef.current });
        } else {
            return;
        }
    }, [context?.settings, portForm]);

    useEffect(() => {
        if (!context?.analyzers) {
            return;
        }

        setAnalyzers(context?.analyzers);
    }, [context?.analyzers]);

    if (analyzers == null) {
        return <div>Loading ...</div>;
    }

    return (
        <Row>
            <Col span={24} style={{ width: "100%", height: "100%" }}>
                {alertVisible.mode === "error" && alertVisible.isOpen && alertVisible.settings === "comm" && (
                    <Alert message={alertVisible.message} type={alertVisible.mode} showIcon closable afterClose={handleCloseAlert}></Alert>
                )}
                {alertVisible.mode === "error" && alertVisible.isOpen && alertVisible.settings === "" && (
                    <Alert message={alertVisible.message} type={alertVisible.mode} showIcon closable afterClose={handleCloseAlert}></Alert>
                )}
                <Card type="inner" title="Communication Settings">
                    <Form
                        form={portForm}
                        name="settings"
                        style={{ width: "300px", height: "100%" }}
                        onFinish={onSettingsFinish}
                        onFinishFailed={onSettingsFinishFailed}
                        layout="horizontal"
                    >
                        <Form.Item<FieldType>
                            label="LIS Port"
                            name="hl7Port"
                            rules={[
                                { required: true, message: "Please input the LIS port!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (new RegExp(/^\d+$/).test(value)) {
                                            return Promise.resolve();
                                        }

                                        return Promise.reject(new Error("Please input a number!"));
                                    }
                                })
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item label="Current IP">
                            <Input value={pcIp} disabled />
                        </Form.Item>

                        <Form.Item style={{ left: 0 }}>
                            <Button type="primary" htmlType="submit" disabled={loading}>
                                Save
                            </Button>
                        </Form.Item>
                    </Form>
                    <div>
                        Please consult the{" "}
                        <a href="https://www.vetlablink.com/setup" rel="noreferrer" target="_blank">
                            {" "}
                            user guide{" "}
                        </a>{" "}
                        on how to setup communication with the analyzer.
                    </div>

                    {!serverLogOpen && (
                        <Button color="default" type="link" onClick={() => setServerLogOpen(true)}>
                            Show server log
                        </Button>
                    )}

                    {serverLogOpen && (
                        <div>
                            <Button color="default" type="link" onClick={() => setServerLogOpen(false)}>
                                Hide server log
                            </Button>
                            <textarea value={serverLog} readOnly style={{ width: "100%", height: "200px" }} />
                        </div>
                    )}

                    {context?.settings?.serverErrors?.length > 0 && <h4>Server errors:</h4>}
                    {context?.settings?.serverErrors.map((error: string) => {
                        return <Alert message={error} type="error" showIcon key={error}></Alert>;
                    })}
                </Card>
            </Col>
            {/* <Col span={24} style={{ marginTop: "10px" }}>
                <Divider><strong>Analyzers List</strong></Divider>

                {alertVisible.mode === "error" && alertVisible.isOpen && alertVisible.settings === "equip" &&
                    <Alert message={alertVisible.message} type={alertVisible.mode} showIcon closable afterClose={handleCloseAlert}></Alert>
                }
                <Modal title="Add a new analyzer" open={isModalOpen} onOk={analyzerForm.submit} onCancel={handleCancel} okText="Submit" centered width={900}>
                    <Card type="inner">
                        <Form
                            form={analyzerForm}
                            name="analyzers"
                            style={{ width: "100%", height: "100%" }}
                            layout="vertical"
                            onFinish={submitNewAnalyzer}
                            onFinishFailed={submitAnalyzerFailed}
                        >
                            <Form.Item label="Application Type" name="applicationType" rules={[{ required: true, message: "Please select a type!" }]}>
                                <Radio.Group>
                                    <Radio value={50}>Seamaty SMT-120V</Radio>
                                    <Radio value={40}>Woodley Insight V3 Plus</Radio>
                                    <Radio value={20}> Genrui VH30</Radio>
                                    <Radio value={30}> Celercare V Insight V-Chem</Radio>
                                    <Radio value={10}> DH56 Woodley Insight V IA Plus</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item label="IP Address" name="ip" rules={[
                                { required: true, message: "Please type the IP address!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if ((new RegExp(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)).test(value)) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Please input a valid IP address!'));
                                    },
                                })
                            ]}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="Settings" name="settings">
                                <Input />
                            </Form.Item>
                        </Form>
                    </Card>
                </Modal>
                <Table
                    columns={columns}
                    rowKey={(record) => record.id}
                    dataSource={analyzers}
                    loading={loading}
                    pagination={false}
                />
                <Button type="primary" onClick={showModal} style={{ float: "right" }}><PlusOutlined />Add analyzer</Button>
            </Col> */}
        </Row>
    );
};

export default Communication;
