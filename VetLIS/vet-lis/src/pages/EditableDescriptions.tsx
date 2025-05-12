import { EditFilled, ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Modal, Radio, Typography } from "antd";
import ButtonGroup from "antd/es/button/button-group";
import { useForm } from "antd/es/form/Form";
import { BaseType } from "antd/es/typography/Base";
import { useEffect, useState } from "react";

const { Text } = Typography;

interface EditableDescriptionProps {
    label: string;
    value: string | number | null;
    status?: string;
    unit?: string;
    range?: string;
    subItem?: string;
    updateCallback: (value: string | number | null, label: string, unit?: string, range?: string, status?: string) => object;
    resetCallback: (label: string) => object;
    overrides: string | null;
}

const EditableDescription: React.FC<EditableDescriptionProps> = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = useForm();
    const [hasOverride, setHasOverride] = useState(false);

    useEffect(() => {
        if (!props.overrides) {
            setHasOverride(false);
            return;
        }

        const parsedOverrides = JSON.parse(props.overrides);

        if (parsedOverrides.hasOwnProperty(props.subItem ?? props.label)) {
            setHasOverride(true);
        } else {
            setHasOverride(false);
        }
    }, [props.overrides]);

    const updateOverrides = () => {
        const formData: { value: string | number | null; label: string; unit?: string; range?: string; status?: string } = form.getFieldsValue();
        props.updateCallback(formData.value, formData.label, formData.unit, formData.range, formData.status);
        setIsModalOpen(false);
    };

    let textType: BaseType | undefined;
    let strong = false;
    switch (props.status) {
        case "L":
            textType = "danger";
            strong = true;
            break;
        case "H":
            textType = "warning";
            strong = true;
            break;
        case "L~A":
            textType = "danger";
            strong = true;
            break;
        case "H~A":
            textType = "warning";
            strong = true;
            break;
    }

    return (
        <>
            <Modal key="modal" title="Edit fields" open={isModalOpen} okText="Update" onOk={form.submit} onCancel={() => setIsModalOpen(false)} centered>
                {props.subItem ? (
                    <Card
                        type="inner"
                        title={
                            props.subItem
                                ? props.subItem
                                : (props.label
                                      ?.replace(/([A-Z])/g, " $1")
                                      .toLowerCase()
                                      .split(" ")
                                      .map((x: string, i: number) => <span style={i === 0 ? { textTransform: "capitalize" } : {}}>{x}&nbsp;</span>) ?? "")
                        }
                    >
                        <Form form={form} name="details-sub" layout="vertical" style={{ width: "100%", height: "100%" }} onFinish={updateOverrides}>
                            <Form.Item name="label" initialValue={props.subItem ? props.subItem : props.label} hidden>
                                <Radio defaultChecked>{props.subItem ? props.subItem : props.label}</Radio>
                            </Form.Item>
                            {props.status && (
                                <Form.Item label="Status" name="status" initialValue={props.status}>
                                    <Input placeholder="Status" />
                                </Form.Item>
                            )}
                            <Form.Item label="Value" name="value" initialValue={props.value}>
                                <Input placeholder="Value" />
                            </Form.Item>
                            {props.unit && (
                                <Form.Item label="Unit" name="unit" initialValue={props.unit}>
                                    <Input placeholder="Unit" />
                                </Form.Item>
                            )}
                            {props.range && (
                                <Form.Item label="Reference Range" name="range" initialValue={props.range}>
                                    <Input placeholder="Range" />
                                </Form.Item>
                            )}
                        </Form>
                    </Card>
                ) : (
                    <Card
                        type="inner"
                        title={
                            props.status || props.status === ""
                                ? props.label
                                : (props.label
                                      ?.replace(/([A-Z])/g, " $1")
                                      .toLowerCase()
                                      .split(" ")
                                      .map((x: string, i: number) => <span style={i === 0 ? { textTransform: "capitalize" } : {}}>{x}&nbsp;</span>) ?? "")
                        }
                    >
                        <Form form={form} name="details" layout="vertical" style={{ width: "100%", height: "100%" }} onFinish={updateOverrides}>
                            <Form.Item name="label" initialValue={props.label} hidden>
                                <Radio defaultChecked>{props.label}</Radio>
                            </Form.Item>
                            {(props.status || props.status === "") && (
                                <Form.Item label="Status" name="status" initialValue={props.status}>
                                    <Input placeholder="Status" />
                                </Form.Item>
                            )}
                            {props.label !== "testTime" && props.label !== "birthDate" && (
                                <Form.Item label="Value" name="value" initialValue={props.value}>
                                    <Input placeholder="Value" />
                                </Form.Item>
                            )}
                            {(props.label === "testTime" || props.label === "birthDate") && (
                                <Form.Item
                                    label="Value"
                                    name="value"
                                    initialValue={props.value}
                                    rules={[
                                        {
                                            validator: (_, value) => {
                                                if (value) {
                                                    const dateFormatRegex =
                                                        /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}, (?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
                                                    if (!dateFormatRegex.test(value)) {
                                                        return Promise.reject("Please enter a valid date format: DD/MM/YYYY, HH:mm:ss");
                                                    }
                                                }

                                                return Promise.resolve();
                                            }
                                        }
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            )}
                            {(props.unit || props.unit === "") && (
                                <Form.Item label="Unit" name="unit" initialValue={props.unit}>
                                    <Input placeholder="Unit" />
                                </Form.Item>
                            )}
                            {props.range && (
                                <Form.Item label="Reference Range" name="range" initialValue={props.range}>
                                    <Input placeholder="Range" />
                                </Form.Item>
                            )}
                        </Form>
                    </Card>
                )}
            </Modal>
            <div key="display" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    {props.status && props.unit ? (
                        <Text strong={strong} type={textType}>
                            {props.status} {props.value} {props.unit}
                        </Text>
                    ) : (
                        <Text strong={strong} type={textType}>
                            {props.value}
                        </Text>
                    )}
                    &nbsp;&nbsp;&nbsp;
                    {props.range && <Text>({props.range})</Text>}
                </div>
                <ButtonGroup>
                    <Button icon={<EditFilled />} onClick={() => setIsModalOpen(true)} title="Edit"></Button>
                    {hasOverride && (
                        <Button icon={<ReloadOutlined />} title="Reset value" onClick={() => props.resetCallback(props.subItem ?? props.label)}></Button>
                    )}
                </ButtonGroup>
            </div>
        </>
    );
};

export default EditableDescription;
