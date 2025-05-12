import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";

import DashboardLayout from "./pages/DashboardLayout";
import Hematology from "./pages/Hematology";
import General from "./pages/General";
import Unknown from "./pages/Unknown";
import Immunoassay from "./pages/ImmunoAssay";
import Biochemistry from "./pages/Biochemistry";
import HematologyDetails from "./pages/HematologyDetails";
import BiochemistryDetails from "./pages/BiochemistryDetails";
import Communication from "./pages/Communication";
import UserInterface from "./pages/UserInterface";
import ImmunoAssayDetails from "./pages/ImmunoAssayDetails";
import UnknownDetails from "./pages/UnknownDetails";
import All from "./pages/All";
import Parameters from "./pages/Parameters";

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <DashboardLayout>
                <Hematology></Hematology>
            </DashboardLayout>
        )
    },
    {
        path: "/biochemistry",
        element: (
            <DashboardLayout>
                <Biochemistry></Biochemistry>
            </DashboardLayout>
        )
    },
    {
        path: "/biochemistry/:messageId",
        element: (
            <DashboardLayout>
                <BiochemistryDetails></BiochemistryDetails>
            </DashboardLayout>
        )
    },
    {
        path: "/general",
        element: (
            <DashboardLayout>
                <General></General>
            </DashboardLayout>
        )
    },
    {
        path: "/immunoassay",
        element: (
            <DashboardLayout>
                <Immunoassay></Immunoassay>
            </DashboardLayout>
        )
    },
    {
        path: "/immunoassay/:messageId",
        element: (
            <DashboardLayout>
                <ImmunoAssayDetails></ImmunoAssayDetails>
            </DashboardLayout>
        )
    },
    {
        path: "/unknown",
        element: (
            <DashboardLayout>
                <Unknown></Unknown>
            </DashboardLayout>
        )
    },
    {
        path: "/unknown/:messageId",
        element: (
            <DashboardLayout>
                <UnknownDetails></UnknownDetails>
            </DashboardLayout>
        )
    },
    {
        path: "/hematology",
        element: (
            <DashboardLayout>
                <Hematology></Hematology>
            </DashboardLayout>
        )
    },
    {
        path: "/hematology/:messageId",
        element: (
            <DashboardLayout>
                <HematologyDetails></HematologyDetails>
            </DashboardLayout>
        )
    },
    {
        path: "/all",
        element: (
            <DashboardLayout>
                <All></All>
            </DashboardLayout>
        )
    },
    {
        path: "/communication",
        element: (
            <DashboardLayout>
                <Communication></Communication>
            </DashboardLayout>
        )
    },
    {
        path: "/user-interface",
        element: (
            <DashboardLayout>
                <UserInterface></UserInterface>
            </DashboardLayout>
        )
    },
    {
        path: "/parameters",
        element: (
            <DashboardLayout>
                <Parameters></Parameters>
            </DashboardLayout>
        )
    }
]);

const App: React.FC = () => {
    return <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />;
};

export default App;
