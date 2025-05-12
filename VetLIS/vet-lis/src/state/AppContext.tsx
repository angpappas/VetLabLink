import React, { createContext, useContext, useEffect, useState } from "react";
import { DataPage } from "../models/DataPage";
import { Hl7Message } from "../models/Hl7Message";
import { Analyzer } from "../models/Analyzers";
import { Settings } from "../models/Settings";
import { TestParameterSetting } from "../models/TestParameterSettings";
import { message } from "antd";

type ContextState = {
    currentPage:
        | ""
        | "dashboard"
        | "biochemistry"
        | "hematology"
        | "immunoassay"
        | "all"
        | "general"
        | "history"
        | "communication"
        | "printer-settings"
        | "user-interface"
        | "parameters";
    setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
    getCurrentPage: () => [string] | undefined;
    fetchLogo: () => void;
    fetchSettings: () => void;
    appTitle: "VetLab Link";
    mostRecentMessageId: number;
    setMostRecentMessageId: React.Dispatch<React.SetStateAction<number>>;
    mostRecentAnalyzerId: number;
    setMostRecentAnalyzerId: React.Dispatch<React.SetStateAction<number>>;
    analyzers: Analyzer[];
    setAnalyzers: React.Dispatch<React.SetStateAction<Analyzer[]>>;
    hematologyEnabled: boolean;
    setHematologyEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    biochemistryEnabled: boolean;
    setBiochemistryEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    immunoassayEnabled: boolean;
    setImmunoassayEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    settings: any;
    setSettings: React.Dispatch<React.SetStateAction<any>>;
    logo: string;
    setLogo: React.Dispatch<React.SetStateAction<string>>;
    category: number;
    setCategory: React.Dispatch<React.SetStateAction<number>>;
    testParameterSettings: { [label: string]: TestParameterSetting };
} | null;

const AppDataContext = createContext<ContextState>(null);

type Props = {
    children?: React.ReactNode;
};

export const AppDataContextProvider: React.FC<Props> = (props) => {
    const appTitle = "VetLab Link";
    const [currentPage, setCurrentPage] = useState("");
    const [mostRecentMessageId, setMostRecentMessageId] = useState(-1);
    const [category, setCategory] = useState(1);
    const [hematologyEnabled, setHematologyEnabled] = useState(false);
    const [biochemistryEnabled, setBiochemistryEnabled] = useState(false);
    const [immunoassayEnabled, setImmunoassayEnabled] = useState(false);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [mostRecentAnalyzerId, setMostRecentAnalyzerId] = useState(-1);
    const [analyzers, setAnalyzers] = useState<Analyzer[]>([]);
    const [logo, setLogo] = useState<string>("");
    const [testParameterSettings, setTestParameterSettings] = useState<{
        [label: string]: TestParameterSetting;
    }>({});

    const fetchLastMessageId = async () => {
        const resp = await fetch(`/api/Messages/LastMessageId?category=${category}`);
        if (resp.status !== 200) {
            alert("Something wrong happened!");
            return;
        }

        const lastMessageId = await resp.json();
        if (lastMessageId > mostRecentMessageId) {
            const resp2 = await fetch(`/api/Messages?page=0&pageSize=50&category=${category}`);
            if (resp.status !== 200) {
                alert("Something wrong happened!");
                return;
            }

            const data: DataPage<Hl7Message> = await resp2.json();
            setMostRecentMessageId(lastMessageId);
        }
    };

    const fetchLogo = async () => {
        const resp = await fetch(`/api/Settings/GetLogo`);
        if (resp.status !== 200) {
            setLogo("");
            return;
        }

        const blob = await resp.blob();
        const logoURL = URL.createObjectURL(blob);
        setLogo(logoURL);
    };

    const fetchAnalyzers = async () => {
        const resp = await fetch(`/api/Analyzers`);
        if (resp.status !== 200) {
            alert("Something wrong happened!");
            return;
        }

        const data: Analyzer[] = await resp.json();
        setAnalyzers(data);
    };

    const fetchTestParameterSettings = async () => {
        const resp = await fetch(`/api/TestParameterSettings/GetAll`);
        if (resp.status !== 200) {
            alert("Something wrong happened!");
            return;
        }

        const data: TestParameterSetting[] = await resp.json();
        const dict: { [label: string]: TestParameterSetting } = {};
        data.forEach((x) => (dict[x.parameter] = x));
        setTestParameterSettings(dict);
    };

    const fetchSettings = async () => {
        const resp = await fetch(`/api/Settings/GetSettings`);
        if (resp.status !== 200) {
            alert("Something wrong happened!");
            return;
        }

        const data: Settings = await resp.json();
        setSettings(data);
    };

    useEffect(() => {
        let title = appTitle;
        switch (currentPage) {
            case "hematology":
                title = `Hematology - ${title}`;
                break;
            case "biochemistry":
                title = `Biochemistry - ${title}`;
                break;
            case "immunoassay":
                title = `Immunoassay - ${title}`;
                break;
            case "unknown":
                title = `Unknown - ${title}`;
                break;
            case "communication":
                title = `Communication - ${title}`;
                break;
            case "user-interface":
                title = `User interface - ${title}`;
                break;
            case "parameters":
                title = `Parameters - ${title}`;
                break;
        }

        document.title = title;
    }, [currentPage]);

    useEffect(() => {
        const timeout = setInterval(() => fetchLastMessageId(), 1500);
        return () => clearInterval(timeout);
    }, [fetchLastMessageId]);

    useEffect(() => {
        fetchSettings();
        fetchAnalyzers();
        fetchLogo();
        fetchTestParameterSettings();
    }, [currentPage]);

    useEffect(() => {
        setHematologyEnabled(analyzers.some((x) => x.applicationType === 40 || x.applicationType === 20));
        setBiochemistryEnabled(analyzers.some((x) => x.applicationType === 30));
        setImmunoassayEnabled(analyzers.some((x) => x.applicationType === 10));
    }, [analyzers]);

    const value: ContextState = {
        currentPage: "hematology",
        appTitle,
        mostRecentMessageId,
        setMostRecentMessageId,
        mostRecentAnalyzerId,
        setMostRecentAnalyzerId,
        analyzers,
        setAnalyzers,
        hematologyEnabled,
        setHematologyEnabled,
        biochemistryEnabled,
        setBiochemistryEnabled,
        immunoassayEnabled,
        setImmunoassayEnabled,
        settings,
        setSettings,
        logo,
        setLogo,
        fetchLogo,
        fetchSettings,
        category,
        setCategory,
        setCurrentPage,
        getCurrentPage: () => {
            if (currentPage) {
                return [currentPage];
            }

            return undefined;
        },
        testParameterSettings
    };

    return <AppDataContext.Provider value={value}>{props.children}</AppDataContext.Provider>;
};

export default function useAppDataContext(): ContextState {
    return useContext(AppDataContext);
}
