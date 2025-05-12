import React, { useState } from "react";
import { Modal, Form, Input, Spin } from "antd";

type MessageInspectionModalProps = {
    message: string;
    onCloseCallback: () => void;
};

const MessageInspectionModal: React.FC<MessageInspectionModalProps> = (props) => {
    const [comments, setComments] = useState("");
    const [loading, setLoading] = useState(false);

    const handleOk = () => {
        setLoading(true);
        try {
            const url = "https://www.vetlablink.com/api/inspect";
            //const url = "https://localhost:52898/api/inspect";
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: props.message,
                    comments: comments
                })
            });

            props.onCloseCallback();
        } catch (error) {
            console.error("Error posting data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        props.onCloseCallback();
    };

    return (
        <>
            <Modal title="Send for inspection" open={true} onOk={handleOk} onCancel={handleCancel}>
                <Spin spinning={loading}>
                    <p>
                        If this record is not displaying correctly in the application, you can share it with us for further analysis. Upon receiving it, we will
                        investigate the issue to enhance support for it in the next version of the application. All data will be handled in accordance with our{" "}
                        <a href="https://www.vetlablink.com/privacy" rel="noopener noreferrer" target="_blank">
                            privacy policy
                        </a>
                        .
                    </p>
                    <Form>
                        <Form.Item label="Comments">
                            <Input.TextArea value={comments} onChange={(e) => setComments(e.target.value)} disabled={loading} />
                        </Form.Item>
                    </Form>
                </Spin>{" "}
            </Modal>
        </>
    );
};

export default MessageInspectionModal;
