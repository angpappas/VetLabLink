import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { MessageDetails } from "../models/Hl7Message";
import useAppDataContext from "../state/AppContext";
import { BiochemistryDataType, readBiochemistry } from "../models/Hl7Parser";
import { Alert, Button, Descriptions, Space } from "antd";
import { Typography } from "antd";
import { LeftCircleFilled, PrinterFilled, RightCircleFilled } from "@ant-design/icons";
import EditableDescription from "./EditableDescriptions";
import { Page, Text as TextPdf, View, Document, StyleSheet, Font, Image } from "@react-pdf/renderer";
import { PDFViewer } from "@react-pdf/renderer";

const { Text } = Typography;
const category = 2;

const BiochemistryDetails: React.FC = (props) => {
    const { messageId } = useParams();
    const location = useLocation();
    const [message, setMessage] = useState<BiochemistryDataType | null>(null);
    const context = useAppDataContext();
    const [alertVisible, setAlertVisible] = useState({
        isOpen: false,
        message: "",
        mode: ""
    });
    const [nextPreviousId, setNextPreviousId] = useState<{
        next: number;
        previous: number;
        totalRecords: number;
        currentRecord: number;
    } | null>(null);

    const handleCloseAlert = () => {
        setAlertVisible({ isOpen: false, message: "", mode: "" });
    };

    Font.register({
        family: "Roboto",
        fonts: [
            {
                src: "/fonts/Roboto-Regular.ttf"
            },
            {
                src: "/fonts/Roboto-Bold.ttf",
                fontWeight: "bold"
            }
        ]
    });

    const styles = StyleSheet.create({
        page: {
            fontFamily: "Roboto",
            alignItems: "center"
        },
        container: {
            display: "flex",
            width: "97%"
        },
        details: {
            fontSize: 10,
            textAlign: "justify"
        },
        section: {
            margin: 3
        },
        title: {
            backgroundColor: "#e36a14",
            fontSize: 15,
            textAlign: "center"
        },
        headerContainer: {
            width: "100%",
            border: 0.5,
            borderStyle: "solid",
            maxHeight: 95
        },
        headerContainerCol1: {
            border: 0,
            width: "10%"
        },
        headerContainerCol2: {
            width: "90%",
            border: 0,
            textAlign: "center",
            fontWeight: "bold"
        },
        logo: {
            marginTop: 5,
            maxHeight: "90%",
            alignSelf: "flex-start"
        },
        chart: {
            width: 180,
            height: 120
        },
        tablesContainer: {
            width: "100%",
            border: 0.5,
            borderStyle: "solid"
        },
        dataTable: {
            width: "100%",
            border: 0,
            alignItems: "stretch"
        },
        chartTable: {
            width: "100%",
            border: 0
        },
        tableRow: {
            flexDirection: "row",
            display: "flex"
        },
        tableCol1: {
            width: "25%",
            textAlign: "center",
            borderStyle: "solid",
            borderWidth: 0,
            borderLeftWidth: 0,
            borderTopWidth: 0
        },
        tableCol2: {
            width: "25%",
            textAlign: "center",
            borderStyle: "solid",
            borderWidth: 0,
            borderLeftWidth: 0,
            borderTopWidth: 0
        },
        tableCol3: {
            width: "25%",
            textAlign: "center",
            borderStyle: "solid",
            borderWidth: 0,
            borderLeftWidth: 0,
            borderTopWidth: 0
        },
        tableCol4: {
            width: "25%",
            textAlign: "center",
            borderStyle: "solid",
            borderWidth: 0,
            borderLeftWidth: 0,
            borderTopWidth: 0
        },
        tableCell: {
            fontSize: 9
        }
    });

    const BiochemistryDocument = () => {
        return (
            <PDFViewer style={{ width: "100vw", height: "100vh" }}>
                <Document>
                    <Page size="A4" style={styles.page}>
                        <View style={styles.container}>
                            <View style={styles.section}></View>
                            <View style={styles.section}></View>

                            <View style={styles.headerContainer}>
                                <View style={styles.tableRow}>
                                    <View style={styles.headerContainerCol1}>{context?.logo && <Image style={styles.logo} src={context?.logo}></Image>}</View>
                                    <View style={styles.headerContainerCol2}>
                                        <TextPdf style={{ fontSize: 10 }}>{context?.settings?.extraInformation}</TextPdf>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.section}></View>

                            <View style={styles.details}>
                                <View style={styles.tableRow}>
                                    <TextPdf>Fullname:</TextPdf>
                                    <TextPdf style={{ fontWeight: "bold" }}>&nbsp;{message?.owner?.toLocaleUpperCase()}</TextPdf>
                                </View>
                                <View style={styles.tableRow}>
                                    <TextPdf>Date:</TextPdf>
                                    <TextPdf style={{ fontWeight: "bold" }}>&nbsp;{message?.testTime?.toLocaleString("en-GB")}</TextPdf>
                                </View>
                                <View style={styles.tableRow}>
                                    <TextPdf>Patient ID:</TextPdf>
                                    <TextPdf style={{ fontWeight: "bold" }}>&nbsp;{message?.patientId}</TextPdf>
                                </View>
                            </View>
                            <View style={styles.section}></View>
                            <View style={styles.title}>
                                <TextPdf>BIOCHEMISTRY TEST</TextPdf>
                            </View>
                            <View style={styles.section}></View>
                            <View style={styles.section}></View>

                            <View style={styles.tablesContainer}>
                                <View style={styles.tableRow}>
                                    <View style={{ width: "100%" }}>
                                        <View style={styles.dataTable}>
                                            <View
                                                style={[
                                                    styles.tableRow,
                                                    {
                                                        textDecoration: "underline",
                                                        fontWeight: "bold",
                                                        marginBottom: 2.5
                                                    }
                                                ]}
                                            >
                                                <View style={[styles.tableCol1]}>
                                                    <TextPdf style={[styles.tableCell, { maxLines: 1 }]}>Test</TextPdf>
                                                </View>
                                                <View style={[styles.tableCol2]}>
                                                    <TextPdf style={styles.tableCell}>Result</TextPdf>
                                                </View>
                                                <View style={[styles.tableCol3]}>
                                                    <TextPdf style={styles.tableCell}>Unit</TextPdf>
                                                </View>
                                                <View style={[styles.tableCol4]}>
                                                    <TextPdf style={styles.tableCell}>Normal&nbsp;range</TextPdf>
                                                </View>
                                            </View>
                                            {message?.measurements.map((x) => (
                                                <View style={styles.tableRow}>
                                                    <View style={[styles.tableCol1]}>
                                                        <TextPdf style={[styles.tableCell, { backgroundColor: "#E4E4E4" }]}>{x.label}</TextPdf>
                                                    </View>
                                                    <View style={[styles.tableCol2]}>
                                                        {typeof x.value === "number" && x.max && x.min && (x.value > x?.max || x.value < x?.min) ? (
                                                            <TextPdf style={[styles.tableCell, { fontWeight: "bold" }]}>{x.value}</TextPdf>
                                                        ) : (
                                                            <TextPdf style={[styles.tableCell]}>{x.value}</TextPdf>
                                                        )}
                                                    </View>
                                                    <View style={[styles.tableCol3]}>
                                                        <TextPdf style={styles.tableCell}>{x.unit}</TextPdf>
                                                    </View>
                                                    <View style={[styles.tableCol4]}>
                                                        <TextPdf style={styles.tableCell}>{x.range}</TextPdf>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.section}></View>
                            <View style={{ left: 5 }}>
                                <TextPdf style={{ fontSize: 12 }}>NOTES:</TextPdf>
                            </View>
                        </View>
                    </Page>
                </Document>
            </PDFViewer>
        );
    };

    const updateOverrides = async (value: string | number | null, label: string, unit?: string, range?: string, status?: string) => {
        if (!messageId) {
            return;
        }

        let overrides: any = {};
        if (message?.overrides) {
            overrides = JSON.parse(message?.overrides) as any;
        }

        if (!overrides[label]) {
            overrides[label] = {};
        }

        if (!range || !unit || !status) {
            overrides[label] = value;
        } else {
            overrides[label].value = value;
        }

        if (range) {
            overrides[label].range = range;
        }

        if (unit) {
            overrides[label].unit = unit;
        }

        if (status) {
            overrides[label].status = status;
        }

        const strOverrides = JSON.stringify(overrides);

        const resp = await fetch(`/api/Messages/UpdateOverrides/${messageId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ overrides: strOverrides })
        });

        if (resp.status !== 200) {
            setAlertVisible({
                isOpen: true,
                message: "Something went wrong!",
                mode: "error"
            });

            return;
        }

        fetchData(messageId);
    };

    const resetOverrides = async (label: string) => {
        if (!window.confirm("Are you sure you want to reset the value to the default one?")) {
            return;
        }

        if (!messageId) {
            return;
        }

        const overrides = message?.overrides ? JSON.parse(message?.overrides) : {};

        delete overrides[label];
        const strOverrides = JSON.stringify(overrides);

        const resp = await fetch(`/api/Messages/UpdateOverrides/${messageId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ overrides: strOverrides })
        });

        if (resp.status !== 200) {
            setAlertVisible({
                isOpen: true,
                message: "Something went wrong!",
                mode: "error"
            });

            return;
        }

        fetchData(messageId);
    };

    const fetchData = async (id: number | string) => {
        const resp = await fetch(`/api/Messages/Details/${id}?category=${category}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = (await resp.json()) as MessageDetails;
        setMessage(readBiochemistry(data.message, context?.testParameterSettings!));
        setNextPreviousId(data);
    };

    useEffect(() => {
        if (messageId) {
            fetchData(messageId);
            context?.setCurrentPage("biochemistry");
        }
    }, [messageId, context?.testParameterSettings]);

    const hasPrevious = () => nextPreviousId?.previous;

    const hasNext = () => nextPreviousId?.next;

    if (!message) {
        return <div>Loading</div>;
    }

    if (location.search.includes("pdf")) {
        if (context?.settings?.extraInformation) {
            return (
                <div
                    id={"pdf"}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 1000,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "white"
                    }}
                >
                    <BiochemistryDocument />
                </div>
            );
        } else {
            return <></>;
        }
    }

    return (
        <>
            <div>
                {alertVisible.mode === "error" && alertVisible.isOpen && (
                    <Alert message={alertVisible.message} type={alertVisible.mode} showIcon closable afterClose={handleCloseAlert}></Alert>
                )}

                <Descriptions
                    column={{ md: 3 }}
                    title={`Sample ID: ${message.sampleId}`}
                    bordered
                    extra={
                        <>
                            <Button href={`${location.pathname}?pdf`} target="_blank">
                                <PrinterFilled />
                                Print
                            </Button>
                            <Link to="/biochemistry">Back</Link>
                        </>
                    }
                >
                    <Descriptions.Item label={<strong>Test time</strong>}>
                        <EditableDescription
                            label="testTime"
                            value={message.testTime?.toLocaleString("en-GB") ?? ""}
                            updateCallback={updateOverrides}
                            resetCallback={resetOverrides}
                            overrides={message.overrides}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label={<strong>Patient ID</strong>}>
                        <EditableDescription
                            label="patientId"
                            value={message.patientId}
                            updateCallback={updateOverrides}
                            resetCallback={resetOverrides}
                            overrides={message.overrides}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label={<strong>Patient name</strong>}>
                        <EditableDescription
                            label="patientName"
                            value={message.patientName}
                            updateCallback={updateOverrides}
                            resetCallback={resetOverrides}
                            overrides={message.overrides}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label={<strong>Owner</strong>}>
                        <EditableDescription
                            label="owner"
                            value={message.owner}
                            updateCallback={updateOverrides}
                            resetCallback={resetOverrides}
                            overrides={message.overrides}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label={<strong>Species</strong>}>
                        <EditableDescription
                            label="species"
                            value={message.species}
                            updateCallback={updateOverrides}
                            resetCallback={resetOverrides}
                            overrides={message.overrides}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label={<strong>Birth date</strong>}>
                        <EditableDescription
                            label="birthDate"
                            value={message.birthDate?.toLocaleString("en-GB") ?? ""}
                            updateCallback={updateOverrides}
                            resetCallback={resetOverrides}
                            overrides={message.overrides}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label={<strong>Gender</strong>}>
                        <EditableDescription
                            label="gender"
                            value={message.gender}
                            updateCallback={updateOverrides}
                            resetCallback={resetOverrides}
                            overrides={message.overrides}
                        />
                    </Descriptions.Item>
                    <Descriptions.Item label={<strong>LOT</strong>}>{message.lot}</Descriptions.Item>
                    <Descriptions.Item label={<strong>Sample type</strong>}>{message.sampleType}</Descriptions.Item>
                    <Descriptions.Item label={<strong>Results</strong>} span={3}>
                        <Space></Space>
                    </Descriptions.Item>
                    {message.measurements.map((x) => (
                        <Descriptions.Item key={x.label} label={<strong>{x.label}</strong>}>
                            <EditableDescription
                                key={x.label}
                                label={x.label}
                                value={x.value}
                                updateCallback={updateOverrides}
                                resetCallback={resetOverrides}
                                overrides={message.overrides}
                                status={x.status}
                                unit={x.unit}
                                range={x.range}
                            />
                        </Descriptions.Item>
                    ))}
                </Descriptions>
                <Space
                    size={"middle"}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "20px"
                    }}
                >
                    <Link
                        to={!hasPrevious() ? "" : `/biochemistry/${hasPrevious()}`}
                        state={location.state}
                        style={!hasPrevious() ? { pointerEvents: "none", opacity: 0.5 } : {}}
                    >
                        <LeftCircleFilled style={{ fontSize: "40px" }} />
                    </Link>
                    <Text style={{ fontSize: "15px" }}>{`#${nextPreviousId?.currentRecord} of ${nextPreviousId?.totalRecords} total`}</Text>
                    <Link
                        to={!hasNext() ? "" : `/biochemistry/${hasNext()}`}
                        state={location.state}
                        style={!hasNext() ? { pointerEvents: "none", opacity: 0.5 } : {}}
                    >
                        <RightCircleFilled style={{ fontSize: "40px" }} />
                    </Link>
                    <Button href={`${location.pathname}?pdf`} target="_blank">
                        <PrinterFilled />
                        Print
                    </Button>
                </Space>
            </div>
        </>
    );
};

export default BiochemistryDetails;
