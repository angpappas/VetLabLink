import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import { Footer } from "antd/es/layout/layout";
import useAppDataContext from "../state/AppContext";
import logo from "../assets/logo-inverted.svg";

const { Header, Content, Sider } = Layout;

type Props = {
    children?: React.ReactNode;
};

const DashboardLayout: React.FC<Props> = (props) => {
    const context = useAppDataContext();
    const location = useLocation();

    if (location.search.includes("pdf")) {
        return <>{props.children}</>;
    }

    return (
        <Layout className="h100">
            <Header style={{ display: "flex", alignItems: "center" }}>
                <Link className="logo" to="/">
                    <img src={logo} alt="VetLab Link" />
                    <div>VetLab Link</div>
                    <small>1.0.2</small>
                </Link>
                <Menu
                    theme="dark"
                    style={{ display: "flex", justifyContent: "flex-end", flexGrow: "1" }}
                    mode="horizontal"
                    selectedKeys={context?.getCurrentPage()}
                >
                    <Menu.SubMenu key="settings" title="Settings">
                        <Menu.Item key="communication">
                            <Link to="/communication">Communication</Link>
                        </Menu.Item>
                        <Menu.Item key="user-interface">
                            <Link to="/user-interface">User interface</Link>
                        </Menu.Item>
                        <Menu.Item key="parameters">
                            <Link to="/parameters">Parameters</Link>
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.Item key="about">
                        <Link target="_blank" to="https://www.vetlablink.com/">
                            About
                        </Link>
                    </Menu.Item>
                </Menu>
            </Header>
            <Layout>
                <Sider width={200}>
                    <Menu
                        mode="inline"
                        style={{ height: "100%", borderRight: 0 }}
                        defaultSelectedKeys={["hematology"]}
                        selectedKeys={location.pathname !== "/" ? location.pathname.split("/") : ["hematology"]}
                    >
                        <Menu.Item key="hematology">
                            <Link to="/hematology">Hematology</Link>
                        </Menu.Item>
                        <Menu.Item key="biochemistry">
                            <Link to="/biochemistry">Biochemistry</Link>
                        </Menu.Item>
                        <Menu.Item key="immunoassay">
                            <Link to="/immunoassay">Immunoassay</Link>
                        </Menu.Item>
                        <Menu.Item key="unknown">
                            <Link to="/unknown">Unknown</Link>
                        </Menu.Item>
                        {/* <Menu.Item key="all">
              <Link to="/all">All</Link>
            </Menu.Item> */}
                    </Menu>
                </Sider>
                <Layout style={{ padding: "0 24px 24px" }}>
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280
                        }}
                    >
                        {props.children}
                    </Content>
                </Layout>
            </Layout>
            <Footer style={{ textAlign: "center" }}>Copyright {new Date().getFullYear()}</Footer>
        </Layout>
    );
};

export default DashboardLayout;
