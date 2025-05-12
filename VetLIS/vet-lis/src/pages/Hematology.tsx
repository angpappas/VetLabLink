import React, { useEffect, useRef, useState } from "react";
import useAppDataContext from "../state/AppContext";
import { DataPage } from "../models/DataPage";
import { Hl7Message } from "../models/Hl7Message";
import { Button, Input, InputRef, Result, Space, Table } from "antd";
import type { ColumnType, ColumnsType, TablePaginationConfig } from "antd/es/table";
import { FilterConfirmProps, FilterValue, SorterResult, TableCurrentDataSource } from "antd/es/table/interface";
import { HematologyDataType, readHematology } from "../models/Hl7Parser";
import { Link } from "react-router-dom";
import { ErrorMessage } from "../models/ErrorMessage";
import { DeleteFilled, EyeTwoTone, SearchOutlined, FileSearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: string;
    sortOrder?: string;
    filters?: Record<string, FilterValue>;
}

type DataIndex = keyof HematologyDataType;

const Hematology: React.FC = (props) => {
    const context = useAppDataContext();
    const category = 1;
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef<InputRef>(null);
    const [statusError, setStatusError] = useState<ErrorMessage | null>(null);
    const [messages, setMessages] = useState<DataPage<HematologyDataType> | null>(null);
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10
        }
    });
    const [loading, setLoading] = useState(false);

    const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: DataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText("");
    };

    const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<HematologyDataType> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys as string[])[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        danger
                        type="default"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        Close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        onFilter: (value, record) =>
            !record[dataIndex]
                ? false
                : record[dataIndex]!.toString()
                      .toLowerCase()
                      .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            )
    });

    const columns: ColumnsType<HematologyDataType> = [
        {
            title: "Test time",
            dataIndex: "testTime",
            sorter: {
                compare: (a, b) => {
                    if (a.testTime === null && b.testTime === null) {
                        return 0;
                    } else if (a.testTime === null) {
                        return -1;
                    } else if (b.testTime === null) {
                        return 1;
                    } else {
                        return a.testTime.getTime() - b.testTime.getTime();
                    }
                }
            },
            key: "testTime",
            render: (record) => record?.toLocaleString("en-GB")
        },
        {
            title: "Patient ID",
            dataIndex: "patientId",
            sorter: {
                compare: (a, b) => {
                    if (a.patientId === b.patientId) {
                        return 0;
                    } else if (a.patientId === null) {
                        return -1;
                    } else if (b.patientId === null) {
                        return 1;
                    } else {
                        return a.patientId > b.patientId ? -1 : 1;
                    }
                }
            },
            key: "patientId",
            ...getColumnSearchProps("patientId")
        },
        {
            title: "Patient name",
            dataIndex: "patientName",
            sorter: {
                compare: (a, b) => {
                    if (a.patientName === null && b.patientName === null) {
                        return 0;
                    } else if (a.patientName === null) {
                        return -1;
                    } else if (b.patientName === null) {
                        return 1;
                    } else {
                        return a.patientName.localeCompare(b.patientName);
                    }
                }
            },
            key: "patientName",
            ...getColumnSearchProps("patientName")
        },
        {
            title: "Owner",
            dataIndex: "owner",
            sorter: {
                compare: (a, b) => {
                    if (a.owner === null && b.owner === null) {
                        return 0;
                    } else if (a.owner === null) {
                        return -1;
                    } else if (b.owner === null) {
                        return 1;
                    } else {
                        return a.owner.localeCompare(b.owner);
                    }
                }
            },
            key: "owner",
            ...getColumnSearchProps("owner")
        },
        {
            title: "Species",
            dataIndex: "species",
            sorter: {
                compare: (a, b) => {
                    if (a.species === null && b.species === null) {
                        return 0;
                    } else if (a.species === null) {
                        return -1;
                    } else if (b.species === null) {
                        return 1;
                    } else {
                        return a.species.localeCompare(b.species);
                    }
                }
            },
            key: "species",
            ...getColumnSearchProps("species")
        },
        {
            title: "Birth date",
            dataIndex: "birthDate",
            sorter: {
                compare: (a: HematologyDataType, b: HematologyDataType) => {
                    if (a.birthDate == null && b.birthDate == null) {
                        return 0;
                    } else if (a.birthDate == null) {
                        return -1;
                    } else if (b.birthDate == null) {
                        return 1;
                    } else {
                        return a.birthDate.getTime() - b.birthDate.getTime();
                    }
                }
            },
            key: "birthDate",
            ...getColumnSearchProps("birthDate")
        },
        {
            title: "Gender",
            dataIndex: "gender",
            sorter: {
                compare: (a, b) => {
                    if (a.gender === null && b.gender === null) {
                        return 0;
                    } else if (a.gender === null) {
                        return -1;
                    } else if (b.gender === null) {
                        return 1;
                    } else {
                        return a.gender.localeCompare(b.gender);
                    }
                }
            },
            key: "gender",
            ...getColumnSearchProps("gender")
        },
        {
            title: "Action",
            key: "action",
            width: "120px",
            render: (_, record, i) => (
                <Space size="small">
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
                    <Button type="default" onClick={() => deleteMessage(record.id)} danger>
                        <DeleteFilled />
                    </Button>
                </Space>
            )
        }
    ];

    const fetchData = async () => {
        try {
            const resp = await fetch(
                `/api/Messages?page=${(tableParams.pagination?.current ?? 1) - 1}&pageSize=${tableParams.pagination?.pageSize}&category=${category}`
            );

            if (resp.status !== 200 || !resp.ok) {
                setStatusError({ status: resp.status, message: resp.statusText });
                return;
            }

            const data: DataPage<Hl7Message> = await resp.json();

            const tmpMessages: DataPage<HematologyDataType> = {
                currentPage: data.currentPage,
                pageSize: data.pageSize,
                totalRecords: data.totalRecords,
                data: data.data.map((x) => readHematology(x, context?.testParameterSettings!))
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
        } catch (error: any) {
            console.log(error);
            setStatusError({ status: 0, message: error.message });
        }
    };

    const deleteMessage = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this message?")) {
            return;
        }

        setLoading(true);
        try {
            const resp = await fetch(`/api/Messages/Delete/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            if (resp.status !== 200) {
                const errorMessage = await resp.text();
                setStatusError({ status: resp.status, message: errorMessage });
            }

            if (messages) {
                setMessages((prv) => {
                    if (!prv) {
                        return prv;
                    }

                    prv.data = prv.data.filter((item) => item.id !== id);
                    return prv;
                });
            }
        } catch {
            setStatusError({ status: 0, message: "Connection failed" });
        }

        setLoading(false);
    };

    useEffect(() => {
        context?.setCurrentPage("hematology");
        context?.setCategory(category);
    }, []);

    useEffect(() => {
        fetchData();
    }, [JSON.stringify(tableParams)]);

    useEffect(() => {
        fetchData();
    }, [context?.mostRecentMessageId]);

    const handleTableChange = (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<HematologyDataType> | SorterResult<HematologyDataType>[],
        extra: TableCurrentDataSource<HematologyDataType>
    ) => {
        setTableParams({
            pagination,
            ...filters,
            ...sorter
        });

        // `dataSource` is useless since `pageSize` changed
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
            <h2 className="titles">Hematology</h2>

            {messages.data.length === 0 && (
                <Result
                    status="info"
                    title="No data found"
                    subTitle={
                        <div>
                            Check the communication <Link to="/communication">settings</Link>
                            {"."}
                        </div>
                    }
                ></Result>
            )}

            {messages.data.length > 0 && (
                <Table
                    columns={columns}
                    rowKey={(record) => record.id}
                    dataSource={messages.data}
                    pagination={tableParams.pagination}
                    onChange={handleTableChange}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default Hematology;
