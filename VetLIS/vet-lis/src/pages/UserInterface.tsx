import { Button, Row, Upload, Col, Form, Card, Alert, Image } from "antd";
import React, { useState, useEffect } from "react";
import useAppDataContext from "../state/AppContext";
import TextArea from "antd/es/input/TextArea";
import { useForm } from "antd/es/form/Form";
import { DeleteFilled } from "@ant-design/icons";

const { Meta } = Card;

const UserInterface: React.FC = (props) => {
    const context = useAppDataContext();
    const [alertVisible, setAlertVisible] = useState({ isOpen: false, message: "", mode: "" });
    const [failCase, setFailCase] = useState(0);
    const [form] = useForm();
    const [noLogo, setNoLogo] = useState("");

    const handleCloseAlert = () => {
        setAlertVisible({ isOpen: false, message: "", mode: "" });
    };

    const onFinish = async (values: any) => {
        if (values.logo) {
            if (!values.logo[0].originFileObj.type.includes("image")) {
                onFinishFailed(1);
                return;
            }

            if (values.logo[0].originFileObj.size > 8 * 1024 * 1024) {
                onFinishFailed(2);
                return;
            }
        }

        const formData = new FormData();
        formData.append("logo", values.logo ? values.logo[0].originFileObj : null);
        formData.append("extraInfo", values.extraInfo);

        const resp = await fetch(`api/Settings/UserInterface`, {
            method: "POST",
            body: formData
        });

        if (resp.status !== 200) {
            onFinishFailed(3);
            return;
        }

        context?.fetchLogo();
        context?.fetchSettings();

        form.resetFields();
        form.setFieldValue("extraInfo", values.extraInfo);
    };

    const onFinishFailed = (errorType: any) => {
        if (errorType === 1) {
            setAlertVisible({ isOpen: true, message: "Please select an image!", mode: "error" });
            setFailCase(1);
        } else if (errorType === 2) {
            setAlertVisible({ isOpen: true, message: "File size is exceeds the limit!", mode: "error" });
            setFailCase(2);
        } else if (errorType === 3) {
            setAlertVisible({ isOpen: true, message: "Data were not submitted!", mode: "error" });
            setFailCase(3);
        }
    };

    const deleteLogo = async () => {
        if (!window.confirm("Are you sure you want to delete the current logo?")) {
            return;
        }

        const resp = await fetch(`/api/Settings/DeleteLogo`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (resp.status !== 200) {
            alert("Something wrong happened!");
        }

        context?.fetchLogo();
    };

    useEffect(() => {
        context?.setCurrentPage("user-interface");
    }, []);

    useEffect(() => {
        if (!context?.logo) {
            setNoLogo(
                "data:image/png;base64,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"
            );
        }
    }, [context?.logo]);

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }

        return e?.fileList;
    };

    if (!context?.settings) {
        return <div>Loading</div>;
    }

    return (
        <Row>
            <Col span={20} style={{ width: "100%", height: "100%" }}>
                {alertVisible.mode === "error" && failCase === 1 && (
                    <Alert message={alertVisible.message} type={alertVisible.mode} showIcon closable afterClose={handleCloseAlert}></Alert>
                )}
                {alertVisible.mode === "error" && failCase === 2 && (
                    <Alert message={alertVisible.message} type={alertVisible.mode} showIcon closable afterClose={handleCloseAlert}></Alert>
                )}
                {alertVisible.mode === "error" && failCase === 3 && (
                    <Alert message={alertVisible.message} type={alertVisible.mode} showIcon closable afterClose={handleCloseAlert}></Alert>
                )}

                <Form
                    name="settings"
                    form={form}
                    style={{ width: "100%", height: "100%" }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    layout="vertical"
                    initialValues={{ extraInfo: context?.settings.extraInformation }}
                >
                    <Card type="inner" title="User interface Settings">
                        <Form.Item
                            name="logo"
                            label="Select a logo"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            extra="Accepts .jpg, jpeg, png, bmp files. Max size: 8MB"
                            style={{ maxWidth: "500px" }}
                        >
                            <Upload accept=".jpg,.jpeg,.png,.bmp" beforeUpload={() => false} maxCount={1} name="logo" listType="picture">
                                <Button>Click to select</Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item name="extraInfo" label="Extra Information">
                            <TextArea rows={6} />
                        </Form.Item>

                        <Form.Item style={{ left: 0 }}>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Card>
                </Form>
            </Col>
            <Col span={4} style={{ width: "100%", height: "100%" }}>
                <Card style={{ width: 220, marginLeft: 20 }} hoverable cover={<Image src={context?.logo ? context.logo : noLogo} />}>
                    <Row>
                        <Col span={20}>{context?.logo ? <Meta title="Current logo" /> : <Meta title="No logo selected" />}</Col>
                        <Col span={4}>
                            {context?.logo && (
                                <Button size="small" type="default" onClick={() => deleteLogo()} danger>
                                    <DeleteFilled />
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
};

export default UserInterface;
