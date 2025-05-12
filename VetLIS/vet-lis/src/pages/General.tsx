import React, { useEffect, useState } from "react";
import useAppDataContext from "../state/AppContext";
import { Button, Space, Table, TablePaginationConfig } from "antd";
import { FilterValue } from "antd/es/table/interface";

interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: string;
    sortOrder?: string;
    filters?: Record<string, FilterValue>;
}

const columns = [
    {
        title: "Sample ID",
        dataIndex: "sampleId",
        sorter: true
    },
    {
        title: "Time",
        dataIndex: "time",
        sorter: true
    },
    {
        title: "Patient name",
        dataIndex: "patientName",
        sorter: true
    },
    {
        title: "Owner",
        dataIndex: "owner",
        sorter: true
    },
    {
        title: "Species",
        dataIndex: "species",
        sorter: true
    },
    {
        title: "Birth date",
        dataIndex: "birthDate",
        sorter: {
            compare: (a: any, b: any) => {
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
        key: "birthDate"
    },
    {
        title: "Action",
        key: "action",
        render: () => (
            <Space size="middle">
                <Button type="primary">Open</Button>
            </Space>
        )
    }
];

const General: React.FC = (props) => {
    const context = useAppDataContext();
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 2
        }
    });

    const data = [
        {
            sampleId: 1,
            time: "10/31/2023, 11:00:00 AM",
            patientName: "Fanis",
            owner: "Andrew Young",
            species: "Dog",
            age: 4
        },
        {
            sampleId: 2,
            time: "10/31/2023, 11:40:00 AM",
            patientName: "Sif",
            owner: "Giorgio Dimi",
            species: "Dog",
            age: 2000
        },
        {
            sampleId: 3,
            time: "10/31/2023, 1:00:00 PM",
            patientName: "Rex",
            owner: "Alex Mot",
            species: "Dog",
            age: 6
        },
        {
            sampleId: 4,
            time: "10/31/2023, 11:00:00 AM",
            patientName: "Garfield",
            owner: "",
            species: "Cat",
            age: 2
        },
        {
            sampleId: 5,
            time: "10/31/2023, 11:40:00 AM",
            patientName: "Sif",
            owner: "Giorgio Dimi",
            species: "Dog",
            age: 2000
        },
        {
            sampleId: 6,
            time: "10/31/2023, 1:00:00 PM",
            patientName: "Gatos Poniros",
            owner: "Bill Papakonstantinou",
            species: "Cat",
            age: 6
        }
    ];

    useEffect(() => {
        context?.setCurrentPage("general");
    }, []);

    const handleTableChange = (pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>) => {
        setTableParams({
            pagination,
            ...filters
        });
    };

    return <Table columns={columns} rowKey={(record) => record.sampleId} dataSource={data} pagination={tableParams.pagination} onChange={handleTableChange} />;
};

export default General;
