import { Button, Input, Result, Space, Table, TablePaginationConfig } from "antd";
import { ColumnsType, FilterValue } from "antd/es/table/interface";
import React, { useEffect, useState } from "react";
import { BiochemistryDataType, HematologyDataType, ImmunoAssayDataType, readBiochemistry, readHematology, readImmunoassay } from "../models/Hl7Parser";
import useAppDataContext from "../state/AppContext";
import { DataPage } from "../models/DataPage";
import { EyeTwoTone } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Hl7Message } from "../models/Hl7Message";
import { ErrorMessage } from "../models/ErrorMessage";

interface TableParams {
    pagination?: TablePaginationConfig;
    filters?: Record<string, FilterValue>;
}

const All: React.FC = (props) => {
    const context = useAppDataContext();
    const [searchText, setSearchText] = useState("");
    const [statusError, setStatusError] = useState<ErrorMessage | null>(null);
    const [messages, setMessages] = useState<DataPage<HematologyDataType | BiochemistryDataType | ImmunoAssayDataType> | null>(null);
    const [patientId, setPatientId] = useState<number | null>(1);
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10
        }
    });
    const [filteredMessages, setFilteredMessages] = useState<(HematologyDataType | BiochemistryDataType | ImmunoAssayDataType)[] | null>(null);

    const patientIdColumns: ColumnsType<HematologyDataType | BiochemistryDataType | ImmunoAssayDataType> = [
        {
            title: "Patient ID",
            dataIndex: "patientId",
            key: "patientId"
        },
        {
            title: "Test time",
            dataIndex: "testTime",
            key: "testTime",
            render: (record) => record?.toLocaleString("en-GB")
        },
        {
            title: "Category",
            dataIndex: "catId",
            key: "catId",
            render: (record) => {
                if (record === 1) {
                    return "Hematology";
                } else if (record === 2) {
                    return "Biochemistry";
                } else {
                    return "Immunoassay";
                }
            }
        },
        {
            title: "Owner",
            dataIndex: "owner",
            key: "owner"
        },
        {
            title: "Patient name",
            dataIndex: "patientName",
            key: "patientName"
        },
        {
            title: "Species",
            dataIndex: "species",
            key: "species"
        },
        {
            title: "Action",
            key: "action",
            width: "120px",
            render: (_, record, i) => (
                <Space size="small">
                    {record.catId === 1 && (
                        <Link
                            to={`/hematology/${record.id}`}
                            state={{
                                totalRecords: messages?.totalRecords ?? 0,
                                messagesList: messages?.data.map((m) => m.id)
                            }}
                        >
                            <Button type="primary" ghost>
                                <EyeTwoTone />
                            </Button>
                        </Link>
                    )}
                    {record.catId === 2 && (
                        <Link
                            to={`/biochemistry/${record.id}`}
                            state={{
                                totalRecords: messages?.totalRecords ?? 0,
                                messagesList: messages?.data.map((m) => m.id)
                            }}
                        >
                            <Button type="primary" ghost>
                                <EyeTwoTone />
                            </Button>
                        </Link>
                    )}
                    {record.catId === 3 && (
                        <Link
                            to={`/immunoassay/${record.id}`}
                            state={{
                                totalRecords: messages?.totalRecords ?? 0,
                                messagesList: messages?.data.map((m) => m.id)
                            }}
                        >
                            <Button type="primary" ghost>
                                <EyeTwoTone />
                            </Button>
                        </Link>
                    )}
                </Space>
            )
        }
    ];

    const fetchData = async () => {
        try {
            const resp = await fetch(
                `/api/Messages/GetAll?page=${(tableParams.pagination?.current ?? 1) - 1}&pageSize=${tableParams.pagination?.pageSize}&patientId=${patientId}`
            );

            if (resp.status !== 200) {
                setStatusError({ status: resp.status, message: resp.statusText });
                return;
            }

            const data: DataPage<Hl7Message> = await resp.json();

            const tmpMessages: DataPage<HematologyDataType | BiochemistryDataType | ImmunoAssayDataType> = {
                currentPage: data.currentPage,
                pageSize: data.pageSize,
                totalRecords: data.totalRecords,
                data: data.data.map((x) => {
                    if (x.category === 1) {
                        return readHematology(x, context?.testParameterSettings!);
                    } else if (x.category === 2) {
                        return readBiochemistry(x, context?.testParameterSettings!);
                    } else {
                        return readImmunoassay(x, context?.testParameterSettings!);
                    }
                })
            };

            setMessages(tmpMessages);
            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    total: data.totalRecords,
                    position: ["bottomCenter"]
                }
            });

            setStatusError(null);
        } catch {
            setStatusError({ status: 0, message: "Connection failed" });
        }
    };

    useEffect(() => {
        context?.setCurrentPage("all");
    }, []);

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)]);

    useEffect(() => {
        if (searchText) {
            setFilteredMessages(messages?.data.filter((x) => x.patientId?.toString().includes(searchText)) ?? []);
        } else {
            setFilteredMessages(null);
        }
    }, [searchText]);

    const handleTableChange = (pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>) => {
        setTableParams({
            pagination,
            ...filters
        });

        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setMessages({
                ...messages!,
                data: []
            });
        }
    };

    if (statusError !== null) {
        return <Result status="error" title={statusError.message} subTitle="Please check the connection!"></Result>;
    }

    if (messages == null) {
        return <div>Loading ...</div>;
    }

    return (
        <div>
            <h2 className="titles">Search by patient ID</h2>

            <Input.Search
                placeholder="Search by patient ID"
                allowClear
                onChange={(e) => {
                    setSearchText(e.target.value);
                }}
                style={{ width: 300 }}
            />
            <Table
                columns={patientIdColumns}
                dataSource={searchText ? (filteredMessages ?? []) : messages?.data}
                rowKey={(record) => record.id}
                pagination={tableParams.pagination}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default All;
