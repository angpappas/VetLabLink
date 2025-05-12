import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { MessageDetails } from "../models/Hl7Message";
import useAppDataContext from "../state/AppContext";
import { HematologyDataType, HematologyHistogramData, readHematology } from "../models/Hl7Parser";
import { Alert, Button, Col, Descriptions, Row, Space } from "antd";
import { Typography } from "antd";
import { Page, Text as TextPdf, View, Document, StyleSheet, Font, Image } from "@react-pdf/renderer";
import { PDFViewer } from "@react-pdf/renderer";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { FileSearchOutlined, LeftCircleFilled, PrinterFilled, RightCircleFilled } from "@ant-design/icons";
import EditableDescription from "./EditableDescriptions";

const imgConverter = require("image-converter-pro");

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const { Text } = Typography;
const category = 1;

const HematologyDetails: React.FC = (props) => {
    const { messageId } = useParams();
    const location = useLocation();
    const [message, setMessage] = useState<HematologyDataType | null>(null);
    const [messageForInspection, setMessageForInspection] = useState<string | null>(null);
    const context = useAppDataContext();
    const [alertVisible, setAlertVisible] = useState({
        isOpen: false,
        message: "",
        mode: ""
    });
    const pltRef = useRef(null);
    const wbcRef = useRef(null);
    const rbcRef = useRef(null);
    const [messageApplicationType, setMessageApplicationType] = useState(0);
    const [nextPreviousId, setNextPreviousId] = useState<MessageDetails | null>(null);

    const handleCloseAlert = () => {
        setAlertVisible({ isOpen: false, message: "", mode: "" });
    };

    //Register font
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
        chartInsight: {
            width: 150,
            height: 75
        },
        chartGenrui: {
            maxHeight: "100%",
            maxWidth: "95%",
            marginTop: 5
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
        tableCol5: {
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

    const HematologyInsightDocument = () => {
        return (
            <PDFViewer style={{ width: "100vw", height: "100vh" }}>
                <Document>
                    <Page size="A4" style={styles.page}>
                        <View style={styles.container}>
                            <View style={styles.section}></View>
                            <View style={styles.section}></View>

                            <View style={styles.headerContainer}>
                                <View style={styles.tableRow}>
                                    <View style={styles.headerContainerCol1}>
                                        {context?.logo ? <Image style={styles.logo} src={context?.logo}></Image> : <></>}
                                    </View>
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
                                <TextPdf>GENERAL BLOOD TEST</TextPdf>
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
                                                <View style={styles.tableCol1}>
                                                    <TextPdf style={[styles.tableCell, { maxLines: 1 }]}>RED&nbsp;SERIES</TextPdf>
                                                </View>
                                                <View style={styles.tableCol3}>
                                                    <TextPdf style={styles.tableCell}>Result</TextPdf>
                                                </View>
                                                <View style={styles.tableCol4}>
                                                    <TextPdf style={styles.tableCell}>Unit</TextPdf>
                                                </View>
                                                <View style={styles.tableCol5}>
                                                    <TextPdf style={styles.tableCell}>Normal&nbsp;range</TextPdf>
                                                </View>
                                            </View>
                                            {message?.measurements.slice(7, 15).map((x, index) => (
                                                <View key={index} style={styles.tableRow}>
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

                                    <View style={{ width: "50%" }}>
                                        <View style={styles.chartTable}>
                                            <View style={styles.tableRow}>
                                                <View>
                                                    {rbcRef.current !== null && (
                                                        <Image style={[styles.chartInsight]} src={(rbcRef.current as any).canvas.toDataURL()}></Image>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

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
                                                <View style={styles.tableCol1}>
                                                    <TextPdf style={[styles.tableCell, { maxLines: 1 }]}>WHITE&nbsp;SERIES</TextPdf>
                                                </View>
                                                <View style={styles.tableCol3}>
                                                    <TextPdf style={styles.tableCell}>Result</TextPdf>
                                                </View>
                                                <View style={styles.tableCol4}>
                                                    <TextPdf style={styles.tableCell}>Unit</TextPdf>
                                                </View>
                                                <View style={styles.tableCol5}>
                                                    <TextPdf style={styles.tableCell}>Normal&nbsp;range</TextPdf>
                                                </View>
                                            </View>
                                            {message?.measurements.slice(0, 7).map((x, index) => (
                                                <View key={index} style={styles.tableRow}>
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

                                    <View style={{ width: "50%" }}>
                                        <View style={[styles.chartTable]}>
                                            <View style={styles.tableRow}>
                                                <View>
                                                    {wbcRef.current !== null && (
                                                        <Image style={[styles.chartInsight]} src={(wbcRef.current as any).canvas.toDataURL()}></Image>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

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
                                                <View style={styles.tableCol1}>
                                                    <TextPdf style={[styles.tableCell, { textAlign: "center" }]}>PLATELETS</TextPdf>
                                                </View>
                                                <View style={styles.tableCol3}>
                                                    <TextPdf style={styles.tableCell}>Result</TextPdf>
                                                </View>
                                                <View style={styles.tableCol4}>
                                                    <TextPdf style={styles.tableCell}>Unit</TextPdf>
                                                </View>
                                                <View style={styles.tableCol5}>
                                                    <TextPdf style={styles.tableCell}>Normal&nbsp;range</TextPdf>
                                                </View>
                                            </View>
                                            {message?.measurements.slice(15, message.measurements.length).map((x, index) => (
                                                <View key={index} style={styles.tableRow}>
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

                                    <View style={{ width: "50%" }}>
                                        <View style={styles.chartTable}>
                                            <View style={styles.tableRow}>
                                                <View>
                                                    {pltRef.current !== null && (
                                                        <Image style={[styles.chartInsight]} src={(pltRef.current as any).canvas.toDataURL()}></Image>
                                                    )}
                                                </View>
                                            </View>
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

    const HematologyGenruiDocument = () => {
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
                                <TextPdf>GENERAL BLOOD TEST</TextPdf>
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
                                                <View style={styles.tableCol1}>
                                                    <TextPdf style={[styles.tableCell, { maxLines: 1 }]}>RED&nbsp;SERIES</TextPdf>
                                                </View>
                                                <View style={styles.tableCol3}>
                                                    <TextPdf style={styles.tableCell}>Result</TextPdf>
                                                </View>
                                                <View style={styles.tableCol4}>
                                                    <TextPdf style={styles.tableCell}>Unit</TextPdf>
                                                </View>
                                                <View style={styles.tableCol5}>
                                                    <TextPdf style={styles.tableCell}>Normal&nbsp;range</TextPdf>
                                                </View>
                                            </View>
                                            {message?.measurements.slice(9, 17).map((x, index) => (
                                                <View key={index} style={styles.tableRow}>
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

                                    <View style={{ width: "50%" }}>
                                        <View style={styles.chartTable}>
                                            <View style={styles.tableRow}>
                                                <View style={{ height: "100%" }}>
                                                    {message?.histograms[1] && (
                                                        <Image
                                                            style={styles.chartGenrui}
                                                            src={
                                                                imgConverter(
                                                                    `data:image/bmp;base64,${message?.histograms[1].imgData}`,
                                                                    170,
                                                                    88,
                                                                    "png",
                                                                    10
                                                                ).then((data: string) => {
                                                                    return data;
                                                                }) ?? ""
                                                            }
                                                        ></Image>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

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
                                                <View style={styles.tableCol1}>
                                                    <TextPdf style={[styles.tableCell, { maxLines: 1 }]}>WHITE&nbsp;SERIES</TextPdf>
                                                </View>
                                                <View style={styles.tableCol3}>
                                                    <TextPdf style={styles.tableCell}>Result</TextPdf>
                                                </View>
                                                <View style={styles.tableCol4}>
                                                    <TextPdf style={styles.tableCell}>Unit</TextPdf>
                                                </View>
                                                <View style={styles.tableCol5}>
                                                    <TextPdf style={styles.tableCell}>Normal&nbsp;range</TextPdf>
                                                </View>
                                            </View>
                                            {message?.measurements.slice(0, 9).map((x, index) => (
                                                <View key={index} style={styles.tableRow}>
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

                                    <View style={{ width: "50%" }}>
                                        <View style={[styles.chartTable]}>
                                            <View style={styles.tableRow}>
                                                <View style={{ height: "100%" }}>
                                                    {message?.histograms[0] && (
                                                        <Image
                                                            style={styles.chartGenrui}
                                                            src={
                                                                imgConverter(
                                                                    `data:image/bmp;base64,${message?.histograms[0].imgData}`,
                                                                    170,
                                                                    88,
                                                                    "png",
                                                                    10
                                                                ).then((data: string) => {
                                                                    return data;
                                                                }) ?? ""
                                                            }
                                                        ></Image>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>

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
                                                <View style={styles.tableCol1}>
                                                    <TextPdf style={[styles.tableCell, { textAlign: "center" }]}>PLATELETS</TextPdf>
                                                </View>
                                                <View style={styles.tableCol3}>
                                                    <TextPdf style={styles.tableCell}>Result</TextPdf>
                                                </View>
                                                <View style={styles.tableCol4}>
                                                    <TextPdf style={styles.tableCell}>Unit</TextPdf>
                                                </View>
                                                <View style={styles.tableCol5}>
                                                    <TextPdf style={styles.tableCell}>Normal&nbsp;range</TextPdf>
                                                </View>
                                            </View>
                                            {message?.measurements.slice(17, message.measurements.length).map((x, index) => (
                                                <View key={index} style={styles.tableRow}>
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

                                    <View style={{ width: "50%" }}>
                                        <View style={styles.chartTable}>
                                            <View style={styles.tableRow}>
                                                <View style={{ height: "100%" }}>
                                                    {message?.histograms[2] && (
                                                        <Image
                                                            style={styles.chartGenrui}
                                                            src={
                                                                imgConverter(
                                                                    `data:image/bmp;base64,${message?.histograms[2].imgData}`,
                                                                    170,
                                                                    88,
                                                                    "png",
                                                                    10
                                                                ).then((data: string) => {
                                                                    return data;
                                                                }) ?? ""
                                                            }
                                                        ></Image>
                                                    )}
                                                </View>
                                            </View>
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

    const getChart = (histo: HematologyHistogramData) => {
        if (histo.imgData) {
            return (
                <img
                    src={`data:image/bmp;base64,${histo.imgData}`}
                    alt={`${histo.label} histogram`}
                    style={{
                        width: "100%",
                        padding: "4px",
                        filter: "invert() contrast(90%)"
                    }}
                />
            );
        }

        let options;
        if (location.search.includes("pdf")) {
            options = {
                responsive: false,
                elements: {
                    point: {
                        radius: 0
                    }
                }
            };
        } else {
            options = {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: histo.label
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: histo.units
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: histo.label
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                }
            };
        }

        const data = {
            labels: Array.from({ length: histo.data.length }, (_, i) => i + 1),
            datasets: [
                {
                    label: histo.label,
                    data: histo.data,
                    backgroundColor: "rgba(0, 123, 255, 0.2)",
                    borderColor: "rgba(0, 123, 255, 1)",
                    borderWidth: 1
                }
            ]
        };

        const plugins = [
            {
                id: "verticalLinePlugin",
                afterDatasetsDraw: (chart: { tooltip?: any; scales?: any; ctx?: any; chartArea?: any }) => {
                    const linePositions = histo.lines.map(function (line) {
                        return chart.scales.x.getPixelForValue(line);
                    });

                    const context = chart.ctx;
                    const chartArea = chart.chartArea;

                    context.save();

                    context.beginPath();
                    linePositions.forEach(function (position) {
                        context.moveTo(position, chartArea.top);
                        context.lineTo(position, chartArea.bottom);
                    });

                    context.strokeStyle = "rgba(255, 0, 0, 0.5)";
                    context.stroke();
                    context.restore();
                }
            }
        ];

        return (
            <>
                {histo.label === "RBC" && <Line width={300} height={150} ref={rbcRef} key={histo.label} options={options} data={data} plugins={plugins} />}
                {histo.label === "WBC" && <Line width={300} height={150} ref={wbcRef} key={histo.label} options={options} data={data} plugins={plugins} />}
                {histo.label === "PLT" && <Line width={300} height={150} ref={pltRef} key={histo.label} options={options} data={data} plugins={plugins} />}
            </>
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

        overrides[label] = {
            value,
            range,
            unit,
            status
        };

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
        setMessage(readHematology(data.message, context?.testParameterSettings!));
        setMessageApplicationType(data.message.applicationType);
        setNextPreviousId(data);
    };

    useEffect(() => {
        if (messageId) {
            fetchData(messageId);
            context?.setCurrentPage("hematology");
        }
    }, [messageId, context?.testParameterSettings]);

    const hasPrevious = () => nextPreviousId?.previous;

    const hasNext = () => nextPreviousId?.next;

    if (!message) {
        return <div>Loading</div>;
    }

    if (location.search.includes("pdf")) {
        if (!context?.settings?.extraInformation) {
            return <></>;
        }

        if (messageApplicationType === 40) {
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
                    <div style={{ position: "absolute", display: "none", top: "0", left: "0", width: "100%", height: "100%" }}>
                        {message.histograms.map((histo) => (
                            <Col span={8} key={histo.label}>
                                {getChart(histo)}
                            </Col>
                        ))}
                    </div>
                    <HematologyInsightDocument />
                </div>
            );
        }

        if (messageApplicationType === 20) {
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
                    <HematologyGenruiDocument />
                </div>
            );
        }
    }

    return (
        <>
            <div style={location.search.includes("pdf") ? { height: 0, overflow: "clip" } : {}}>
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
                            <Link to="/hematology">Back</Link>
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
                            key={"owner"}
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
                    <Descriptions.Item label={<strong>Gender</strong>} span={3}>
                        <EditableDescription
                            label="gender"
                            value={message.gender}
                            updateCallback={updateOverrides}
                            resetCallback={resetOverrides}
                            overrides={message.overrides}
                        />
                    </Descriptions.Item>
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

                <Row>
                    {message.histograms.map((histo) => (
                        <Col span={8} key={histo.label}>
                            {getChart(histo)}
                        </Col>
                    ))}
                </Row>

                <Space
                    size={"large"}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "20px"
                    }}
                >
                    <Link
                        to={!hasPrevious() ? "" : `/hematology/${hasPrevious()}`}
                        state={location.state}
                        style={!hasPrevious() ? { pointerEvents: "none", opacity: 0.5 } : {}}
                    >
                        <LeftCircleFilled style={{ fontSize: "40px" }} />
                    </Link>
                    <Text style={{ fontSize: "15px" }}>{`#${nextPreviousId?.currentRecord} of ${nextPreviousId?.totalRecords} total`}</Text>
                    <Link
                        to={!hasNext() ? "" : `/hematology/${hasNext()}`}
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

export default HematologyDetails;
