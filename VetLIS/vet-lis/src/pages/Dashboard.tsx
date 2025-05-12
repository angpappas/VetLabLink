import React, { useEffect } from "react";
import useAppDataContext from "../state/AppContext";

const Dashboard: React.FC = (props) => {
    const context = useAppDataContext();

    useEffect(() => {
        context?.setCurrentPage("dashboard");
    }, []);

    return <div>Dashboard</div>;
};

export default Dashboard;
