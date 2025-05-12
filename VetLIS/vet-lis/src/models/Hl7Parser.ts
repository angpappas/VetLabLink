import { Hl7Message } from "./Hl7Message";
import { parse } from "date-fns";
import { TestParameterSetting } from "./TestParameterSettings";

export interface HematologyDataType {
    id: number;
    catId: number;
    messageDate: Date | null;
    sampleId: string | null;
    patientName: string | null;
    patientId: string | null;
    owner: string | null;
    species: string | null;
    gender: string | null;
    bloodMode: string | null;
    birthDate: Date | null;
    testTime: Date | null;
    measurements: Array<HematologyMeasurement>;
    histograms: Array<HematologyHistogramData>;
    overrides: string | null;
    hl7: string;
}

export interface HematologyMeasurement {
    label: string;
    value: number | string;
    unit: string;
    status: string;
    range: string;
    min: number | null;
    max: number | null;
}

export interface HematologyHistogramData {
    label: string;
    data: number[];
    units: string;
    lines: number[];
    imgData?: string;
}

export interface BiochemistryDataType {
    id: number;
    catId: number;
    messageDate: Date | null;
    sampleType: string | null;
    patientName: string | null;
    patientId: string | null;
    owner: string | null;
    species: string | null;
    birthDate: Date | null;
    gender: string | null;
    lot: string | null;
    testTime: Date | null;
    sampleId: string | null;
    measurements: Array<BiochemistryMeasurement>;
    overrides: string | null;
    hl7: string;
}

export interface BiochemistryMeasurement {
    label: string;
    value: number | string;
    unit: string;
    range: string;
    min: number;
    max: number;
    status: string;
    observationDate: Date | null;
}

export interface ImmunoAssayDataType {
    id: number;
    catId: number;
    messageDate: Date | null;
    patientId: string | null;
    patientName: string | null;
    owner: string | null;
    species: string | null;
    birthDate: Date | null;
    gender: string | null;
    testTime: Date | null;
    sampleId: string | null;
    sampleType: string | null;
    measurements: Array<ImmunoAssayMeasurement>;
    overrides: string | null;
    hl7: string;
}

export interface ImmunoAssayMeasurement {
    label: string;
    item: string;
    subItem: string;
    value: number;
    unit: string;
    range: string;
    min: number;
    max: number;
    status: string;
    resultStatus: string;
}

export interface UnknownDataType {
    id: number;
    catId: number;
    messageDate: Date | null;
    patientId: string | null;
    patientName: string | null;
    owner: string | null;
    species: string | null;
    gender: string | null;
    testTime: Date | null;
    sampleId: string | null;
    sampleType: string | null;
    birthDate: Date | null;
    measurements: Array<UnknownMeasurement>;
    overrides: string | null;
    hl7: string;
}

export interface UnknownMeasurement {
    label: string;
    value: number | string;
    unit: string;
    range: string;
    min: number;
    max: number;
    status: string;
}

export const readHematology = (message: Hl7Message, testParameterSettings: { [label: string]: TestParameterSetting }): HematologyDataType => {
    if (message.applicationType === 20) {
        return readHematologyGenrui(message, testParameterSettings);
    } else {
        return readHematologyInsight(message, testParameterSettings);
    }
};

const parseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) {
        return null;
    }

    const dateFormats = ["yyyyMMddHHmmss", "yyyyMMddHHmm", "yyyyMMddHH", "yyyyMMdd", "MMddyyyyHHmmss", "ddMMyyyyHHmmss", "ddMMyyyyHHmm"];
    for (const format of dateFormats) {
        const result = parse(dateStr, format, new Date());
        if (!isNaN(result.getTime())) {
            return result;
        }
    }

    return null;
};

const isObservationValueTypeLiteral = (valueType: string): boolean => {
    return valueType === "ST" || valueType === "TX" || valueType === "FT" || valueType === "NM";
};

const parseDateString = (dateString: string) => {
    const parsedDate = new Date(
        parseInt(dateString.substring(6, 10)),
        parseInt(dateString.substring(3, 5)) - 1,
        parseInt(dateString.substring(0, 2)),
        parseInt(dateString.substring(12, 14)),
        parseInt(dateString.substring(15, 17)),
        parseInt(dateString.substring(18, 20))
    );

    return parsedDate;
};

const readHematologyInsight = (message: Hl7Message, testParameterSettings: { [label: string]: TestParameterSetting }): HematologyDataType => {
    const result: HematologyDataType = {
        id: message.id,
        birthDate: null,
        catId: 1,
        messageDate: new Date(),
        sampleId: "",
        patientName: null,
        patientId: null,
        owner: null,
        species: null,
        gender: null,
        bloodMode: "Whole blood",
        testTime: new Date(),
        overrides: message.overrides,
        measurements: [],
        histograms: [],
        hl7: message.message
    };

    const lines = message.message.split("\n");
    lines.forEach((l) => {
        const section = l.split("|");
        if (l.startsWith("MSH")) {
            result.messageDate = section[6] ? parse(section[6], "yyyyMMddHHmmss", new Date()) : null;
        } else if (l.startsWith("PID")) {
            result.patientName = section[5];
            result.birthDate = parseDate(section[7]);
            result.patientId = section[2] ? section[2].replaceAll("^", " ").trim() : "";

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                if (overrides.hasOwnProperty("patientName")) {
                    result.patientName = overrides.patientName.value;
                }

                if (overrides.hasOwnProperty("birthDate")) {
                    result.birthDate = parseDateString(overrides.birthDate);
                }

                if (overrides.hasOwnProperty("gender")) {
                    result.gender = overrides.gender.value;
                }

                if (overrides.hasOwnProperty("patientId")) {
                    result.patientId = overrides.patientId.value;
                }
            }
        } else if (l.startsWith("OBR")) {
            result.sampleId = section[3];
            result.testTime = parseDate(section[7]);
            result.species = section[16].replaceAll("^", " ");

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                if (overrides.hasOwnProperty("species")) {
                    result.species = overrides.species.value;
                }

                if (overrides.hasOwnProperty("testTime")) {
                    result.testTime = parseDateString(overrides.testTime.value);
                }
            }
        } else if (l.startsWith("OBX|1|NM")) {
            let minMax;
            if (section[7].includes("-+")) {
                minMax = section[7].split("-+").map(parseFloat);
            } else if (section[7].includes("--")) {
                minMax = section[7].split("--").map(parseFloat);
            } else {
                minMax = section[7].split("-").map(parseFloat);
            }

            if (!result.owner) {
                result.owner = section[section.length - 3];
            }

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                if (overrides.hasOwnProperty("owner")) {
                    result.owner = overrides.owner.value;
                }
            }

            result.measurements.push({
                label: section[3].replaceAll("^", ""),
                value: Number.isNaN(parseFloat(section[5])) ? section[5] : parseFloat(section[5]),
                unit: section[6],
                status: section[8],
                range: section[7].replace("--", "-+"),
                min: minMax[0],
                max: minMax[1]
            });
        } else if (l.indexOf("Histogram^32Byte^HEX") !== -1) {
            const paramName = section[3].replace("Histogram", "");
            const units = lines
                .find((x) => x.indexOf(`OBX|1|NM|${paramName}|`) !== -1)!
                .split("|")[6]
                .substring(1);
            const hexString = section.find((x) => x.indexOf("Histogram^32") !== -1)!.split("^")[4];
            const hexArray = hexString.match(/.{1,2}/g)!;
            const decimalArray = hexArray.map((hex) => {
                return parseInt(hex, 16);
            });

            const histo: HematologyHistogramData = {
                label: paramName,
                units: units,
                data: decimalArray,
                lines: []
            };

            let tmp = lines.find((x) => x.indexOf(`OBX|2|NM|${paramName}Histogram^LeftLine|`) !== -1);
            if (tmp) {
                histo.lines.push(parseInt(tmp.split("|")[5]));
            }

            tmp = lines.find((x) => x.indexOf(`OBX|2|NM|${paramName}Histogram^MiddleLine|`) !== -1);
            if (tmp) {
                histo.lines.push(parseInt(tmp.split("|")[5]));
            }

            tmp = lines.find((x) => x.indexOf(`OBX|2|NM|${paramName}Histogram^RightLine|`) !== -1);
            if (tmp) {
                histo.lines.push(parseInt(tmp.split("|")[5]));
            }

            result.histograms.push(histo);
        }
    });

    if (testParameterSettings) {
        result.measurements.forEach((m) => {
            const label = m.label;
            if (!testParameterSettings[label]) {
                return;
            }

            const values = eval(testParameterSettings[label].function.replace("#msg-str#", JSON.stringify(m)));
            m.label = values.label;
            m.value = values.value;
            m.status = values.status;
            m.unit = values.unit;
            m.range = values.range;
        });
    }

    if (result.overrides) {
        const overrides = JSON.parse(result.overrides);
        result.measurements.forEach((m) => {
            const label = m.label;
            if (overrides[label]) {
                m.status = overrides[label].status;
                m.value = Number.isNaN(parseFloat(overrides[label].value)) ? overrides[label].value : parseFloat(overrides[label].value);
                m.unit = overrides[label].unit;
                m.range = overrides[label].range;
                let minMax;
                if (m.range.includes("-+")) {
                    minMax = m.range.split("-+").map(parseFloat);
                } else if (m.range.includes("--")) {
                    minMax = m.range.split("--").map(parseFloat);
                } else {
                    minMax = m.range.split("-").map(parseFloat);
                }

                m.min = minMax[0];
                m.max = minMax[1];
            }
        });
    }

    return result;
};

const readHematologyGenrui = (message: Hl7Message, testParameterSettings: { [label: string]: TestParameterSetting }): HematologyDataType => {
    const result: HematologyDataType = {
        id: message.id,
        catId: 1,
        messageDate: new Date(),
        birthDate: null,
        sampleId: null,
        patientName: null,
        patientId: null,
        owner: null,
        species: null,
        gender: null,
        bloodMode: "Whole blood",
        testTime: new Date(),
        overrides: message.overrides,
        measurements: [],
        histograms: [],
        hl7: message.message
    };

    const lines = message.message.split("\n");
    lines.forEach((l) => {
        const section = l.split("|");
        if (l.startsWith("MSH")) {
            result.messageDate = section[6] ? parse(section[6], "yyyyMMddHHmmss", new Date()) : null;
        } else if (l.startsWith("PID")) {
            result.patientName = section[5];
            result.birthDate = parseDate(section[7]);
            result.patientId = section[4] ? section[4].replaceAll("^", " ").trim() : "";
            result.species = section[6].replaceAll("^", " ");

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                if (overrides.hasOwnProperty("patientName")) {
                    result.patientName = overrides.patientName.value;
                }

                if (overrides.hasOwnProperty("birthDate")) {
                    result.birthDate = parseDateString(overrides.birthDate);
                }

                if (overrides.hasOwnProperty("species")) {
                    result.species = overrides.species.value;
                }

                if (overrides.hasOwnProperty("gender")) {
                    result.gender = overrides.gender.value;
                }

                if (overrides.hasOwnProperty("patientId")) {
                    result.patientId = overrides.patientId.value;
                }
            }
        }

        if (l.startsWith("OBR")) {
            result.sampleId = section[3];
            result.testTime = parseDate(section[7]);

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                if (overrides.hasOwnProperty("testTime")) {
                    result.testTime = parseDateString(overrides.testTime.value);
                }
            }
        } else if (l.startsWith("OBX") && !l.includes("Histogram")) {
            let minMax;
            if (section[7].includes("-+")) {
                minMax = section[7].split("-+").map(parseFloat);
            } else if (section[7].includes("--")) {
                minMax = section[7].split("--").map(parseFloat);
            } else {
                minMax = section[7].split("-").map(parseFloat);
            }

            if (!result.owner) {
                result.owner = section[section.length - 3];
            }

            const me = {
                label: section[3].replaceAll("^", ""),
                value: isNaN(parseFloat(section[5])) ? section[5] : parseFloat(section[5]),
                unit: section[6],
                status: section[8],
                range: section[7].includes("-") ? section[7].replace("--", "-+") : "",
                min: minMax[0],
                max: minMax[1]
            };

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                if (overrides.hasOwnProperty("owner")) {
                    result.owner = overrides.owner.value;
                }
            }

            result.measurements.push(me);
        } else if (l.startsWith("OBX") && l.includes("Histogram") && l.includes("ED")) {
            const paramName = section[3].replace("Histogram_BMP", "").replaceAll("^", "");
            const value = section[5].replace("^Image^BMP^Base64^", "");
            const hex = value.toString();
            let str = "";
            for (let i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }

            result.histograms.push({
                imgData: str,
                label: paramName,
                units: "",
                data: [],
                lines: []
            });
        }
    });

    if (testParameterSettings) {
        result.measurements.forEach((m) => {
            const label = m.label;
            if (!testParameterSettings[label]) {
                return;
            }

            const values = eval(testParameterSettings[label].function.replace("#msg-str#", JSON.stringify(m)));
            m.label = values.label;
            m.value = values.value;
            m.status = values.status;
            m.unit = values.unit;
            m.range = values.range;
        });
    }

    if (result.overrides) {
        const overrides = JSON.parse(result.overrides);
        result.measurements.forEach((m) => {
            const label = m.label;
            if (!overrides[label]) {
                return;
            }

            m.status = overrides[label].status;
            m.value = Number.isNaN(parseFloat(overrides[label].value)) ? overrides[label].value : parseFloat(overrides[label].value);
            m.unit = overrides[label].unit;
            m.range = overrides[label].range;
            let minMax;
            if (m.range.includes("-+")) {
                minMax = m.range.split("-+").map(parseFloat);
            } else if (m.range.includes("--")) {
                minMax = m.range.split("--").map(parseFloat);
            } else {
                minMax = m.range.split("-").map(parseFloat);
            }

            m.min = minMax[0];
            m.max = minMax[1];
        });
    }

    return result;
};

export const readBiochemistry = (message: Hl7Message, testParameterSettings: { [label: string]: TestParameterSetting }): BiochemistryDataType => {
    const dateFormat = "yyyyMMddHHmmss";
    const result: BiochemistryDataType = {
        id: message.id,
        catId: 2,
        sampleId: null,
        messageDate: new Date(),
        sampleType: null,
        patientName: null,
        patientId: null,
        owner: null,
        species: null,
        birthDate: null,
        gender: null,
        lot: null,
        testTime: new Date(),
        measurements: [],
        overrides: message.overrides,
        hl7: message.message
    };

    const isSmt120v: boolean = message.message.indexOf("SMT-120V") !== -1;
    let speciesIndex = 5;
    let patientNameIndex = 6;
    if (isSmt120v) {
        speciesIndex = 10;
        patientNameIndex = 5;
    }

    const lines = message.message.split("\n");
    lines.forEach((l) => {
        const section = l.split("|");
        if (l.startsWith("MSH")) {
            result.messageDate = section[6] ? parse(section[6], dateFormat, new Date()) : null;
        } else if (l.startsWith("PID")) {
            result.species = section[speciesIndex].replaceAll("^", " ");
            if (isSmt120v) {
                const patientName = section[patientNameIndex].split("^");
                result.patientName = "";
                result.owner = "";
                if (patientName.length > 1) {
                    result.patientName = patientName[1];
                }

                if (patientName.length > 0) {
                    result.owner = patientName[0];
                }
            } else {
                result.patientName = section[patientNameIndex].replaceAll("^", " ");
                result.owner = section[7];
            }

            result.patientId = section[3] ? section[3].replaceAll("^", " ").trim() : "";
            result.birthDate = parseDate(section[9]);
            switch (section[10]) {
                case "F":
                    result.gender = "Female";
                    break;
                case "M":
                    result.gender = "Male";
                    break;
                case "N":
                    result.gender = "Neutral";
                    break;
                case "O":
                    result.gender = "Other";
                    break;
            }

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                if (overrides.hasOwnProperty("patientName")) {
                    result.patientName = overrides.patientName;
                }

                if (overrides.hasOwnProperty("birthDate")) {
                    result.birthDate = parseDateString(overrides.birthDate);
                }

                if (overrides.hasOwnProperty("species")) {
                    result.species = overrides.species;
                }

                if (overrides.hasOwnProperty("owner")) {
                    result.owner = overrides.owner;
                }

                if (overrides.hasOwnProperty("gender")) {
                    result.gender = overrides.gender;
                }

                if (overrides.hasOwnProperty("patientId")) {
                    result.patientId = overrides.patientId;
                }
            }
        } else if (l.startsWith("OBR")) {
            result.sampleId = section[3];
            result.testTime = parseDate(section[7]);
            result.sampleType = section[15];
            result.lot = section[section.length - 5];

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                if (overrides.hasOwnProperty("testTime")) {
                    result.testTime = parseDateString(overrides.testTime);
                }
            }
        } else if (l.startsWith("OBX")) {
            let minMax;
            if (section[7].includes("-+")) {
                minMax = section[7].split("-+").map(parseFloat);
            } else if (section[7].includes("--")) {
                minMax = section[7].split("--").map(parseFloat);
            } else {
                minMax = section[7].split("-").map(parseFloat);
            }

            result.measurements.push({
                label: section[4],
                value: Number.isNaN(parseFloat(section[5])) ? section[5] : parseFloat(section[5]),
                unit: section[6],
                range: section[7],
                min: minMax[0],
                max: minMax[1],
                status: section[8],
                observationDate: section[14] ? parse(section[14], dateFormat, new Date()) : null
            });

            if (testParameterSettings) {
                result.measurements.forEach((m) => {
                    const label = m.label;
                    if (!testParameterSettings[label]) {
                        return;
                    }

                    const values = eval(testParameterSettings[label].function.replace("#msg-str#", JSON.stringify(m)));
                    m.label = values.label;
                    m.value = values.value;
                    m.status = values.status;
                    m.unit = values.unit;
                    m.range = values.range;
                });
            }

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                result.measurements.forEach((m) => {
                    const label = m.label;
                    if (overrides[label]) {
                        m.status = overrides[label].status;
                        m.value = Number.isNaN(parseFloat(overrides[label].value)) ? overrides[label].value : parseFloat(overrides[label].value);
                        m.unit = overrides[label].unit;
                        m.range = overrides[label].range;
                        let minMax;
                        if (m.range.includes("-+")) {
                            minMax = m.range.split("-+").map(parseFloat);
                        } else if (m.range.includes("--")) {
                            minMax = m.range.split("--").map(parseFloat);
                        } else {
                            minMax = m.range.split("-").map(parseFloat);
                        }

                        m.min = minMax[0];
                        m.max = minMax[1];
                    } else {
                        return;
                    }
                });
            }
        }
    });

    return result;
};

export const readImmunoassay = (message: Hl7Message, testParameterSettings: { [label: string]: TestParameterSetting }): ImmunoAssayDataType => {
    const dateFormat = "yyyyMMddHHmmss";
    const result: ImmunoAssayDataType = {
        id: message.id,
        catId: 3,
        sampleId: null,
        messageDate: new Date(),
        patientName: "",
        patientId: null,
        owner: null,
        species: null,
        birthDate: null,
        gender: "",
        testTime: null,
        sampleType: "",
        measurements: [],
        overrides: message.overrides,
        hl7: message.message
    };

    let lines = message.message.split("\n");
    if (lines.length <= 1) {
        lines = message.message.split("\r");
    }

    if (lines.length <= 1) {
        lines = message.message.split("\r\n");
    }

    lines.forEach((l) => {
        const section = l.split("|");
        if (l.startsWith("MSH")) {
            result.messageDate = section[6] ? parse(section[6], dateFormat, new Date()) : null;
        } else if (l.startsWith("PID")) {
            result.patientId = section[2].replaceAll("^", " ").trim();
            result.patientName = section[5].replace("^", " ");
            result.birthDate = parseDate(section[7]);
            result.gender = section[section.length - 1].replace("\r", "");

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                if (overrides.hasOwnProperty("patientName")) {
                    result.patientName = overrides.patientName;
                }

                if (overrides.hasOwnProperty("birthDate")) {
                    result.birthDate = parseDateString(overrides.birthDate);
                }

                if (overrides.hasOwnProperty("gender")) {
                    result.gender = overrides.gender;
                }

                if (overrides.hasOwnProperty("owner")) {
                    result.owner = overrides.owner;
                }

                if (overrides.hasOwnProperty("gender")) {
                    result.gender = overrides.gender;
                }

                if (overrides.hasOwnProperty("species")) {
                    result.species = overrides.species;
                }

                if (overrides.hasOwnProperty("patientId")) {
                    result.patientId = overrides.patientId;
                }
            }
        } else if (l.startsWith("OBR")) {
            result.sampleId = section[3];
            result.testTime = parseDate(section[7]);
            result.sampleType = section[15] === "0" ? "Serum Plasma" : "Unknown";

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                if (overrides.hasOwnProperty("testTime")) {
                    result.testTime = parseDateString(overrides.testTime);
                }
            }
        } else if (l.startsWith("OBX")) {
            let minMax;
            if (section[7].includes("-+")) {
                minMax = section[7].split("-+").map(parseFloat);
            } else if (section[7].includes("--")) {
                minMax = section[7].split("--").map(parseFloat);
            } else {
                minMax = section[7].split("-").map(parseFloat);
            }

            const items = section[4].split("^");
            result.measurements.push({
                label: section[4],
                item: items[1].replace("-", ""),
                subItem: items[2],
                value: parseFloat(section[5]),
                unit: section[6],
                range: section[7],
                min: minMax[0],
                max: minMax[1],
                status: section[8],
                resultStatus: section[section.length - 1].replace("\r", "")
            });

            if (testParameterSettings) {
                result.measurements.forEach((m) => {
                    const label = m.subItem;
                    if (!testParameterSettings[label]) {
                        return;
                    }

                    const values = eval(testParameterSettings[label].function.replace("#msg-str#", JSON.stringify(m)));
                    m.label = values.label;
                    m.value = values.value;
                    m.status = values.status;
                    m.unit = values.unit;
                    m.range = values.range;
                });
            }

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                result.measurements.forEach((m) => {
                    const label = m.subItem;
                    if (overrides[label]) {
                        m.status = overrides[label].status;
                        m.value = Number.isNaN(parseFloat(overrides[label].value)) ? overrides[label].value : parseFloat(overrides[label].value);
                        m.unit = overrides[label].unit;
                        m.range = overrides[label].range;
                        let minMax;
                        if (m.range.includes("-+")) {
                            minMax = m.range.split("-+").map(parseFloat);
                        } else if (m.range.includes("--")) {
                            minMax = m.range.split("--").map(parseFloat);
                        } else {
                            minMax = m.range.split("-").map(parseFloat);
                        }

                        m.min = minMax[0];
                        m.max = minMax[1];
                    } else {
                        return;
                    }
                });
            }
        }
    });

    return result;
};

export const readUnknown = (message: Hl7Message, testParameterSettings: { [label: string]: TestParameterSetting }): UnknownDataType => {
    const dateFormat = "yyyyMMddHHmmss";
    const result: UnknownDataType = {
        id: message.id,
        catId: 0,
        messageDate: new Date(),
        sampleType: null,
        sampleId: null,
        patientName: null,
        patientId: null,
        owner: null,
        species: null,
        birthDate: null,
        gender: null,
        testTime: new Date(),
        measurements: [],
        overrides: message.overrides,
        hl7: message.message
    };

    const lines = message.message.split("\n");
    lines.forEach((l) => {
        const section = l.split("|");
        if (l.startsWith("MSH")) {
            result.messageDate = section[6] ? parse(section[6], dateFormat, new Date()) : null;
        } else if (l.startsWith("PID")) {
            result.species = section[5].replaceAll("^", " ");
            result.patientName = section[5].replaceAll("^", " ");
            result.patientId = section[3] ? section[3].replaceAll("^", " ").trim() : "";
            result.owner = section[7];
            result.birthDate = parseDate(section[9]);
            switch (section[8]) {
                case "F":
                    result.gender = "Female";
                    break;
                case "M":
                    result.gender = "Male";
                    break;
                case "N":
                    result.gender = "Neutral";
                    break;
                case "O":
                    result.gender = "Other";
                    break;
            }

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                if (overrides.hasOwnProperty("patientName")) {
                    result.patientName = overrides.patientName;
                }

                if (overrides.hasOwnProperty("birthDate")) {
                    result.birthDate = parseDateString(overrides.birthDate);
                }

                if (overrides.hasOwnProperty("species")) {
                    result.species = overrides.species;
                }

                if (overrides.hasOwnProperty("owner")) {
                    result.owner = overrides.owner;
                }

                if (overrides.hasOwnProperty("gender")) {
                    result.gender = overrides.gender;
                }

                if (overrides.hasOwnProperty("patientId")) {
                    result.patientId = overrides.patientId;
                }
            }
        } else if (l.startsWith("OBR")) {
            result.sampleId = section[3];
            result.testTime = parseDate(section[7]);
            result.sampleType = section[4].replaceAll("^", " ");

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                if (overrides.hasOwnProperty("testTime")) {
                    result.testTime = parseDateString(overrides.testTime);
                }
            }
        } else if (l.startsWith("OBX") && isObservationValueTypeLiteral(section[2])) {
            let minMax;
            if (section[7].includes("-+")) {
                minMax = section[7].split("-+").map(parseFloat);
            } else if (section[7].includes("--")) {
                minMax = section[7].split("--").map(parseFloat);
            } else {
                minMax = section[7].split("-").map(parseFloat);
            }

            result.measurements.push({
                label: `${section[3]} ${section[4]}`.replaceAll("^", " ").trim(),
                value: Number.isNaN(parseFloat(section[5])) ? section[5] : parseFloat(section[5]),
                unit: section[6],
                range: section[7],
                min: minMax[0],
                max: minMax[1],
                status: section[8]
            });

            if (testParameterSettings) {
                result.measurements.forEach((m) => {
                    const label = m.label;
                    if (!testParameterSettings[label]) {
                        return;
                    }

                    const values = eval(testParameterSettings[label].function.replace("#msg-str#", JSON.stringify(m)));
                    m.label = values.label;
                    m.value = values.value;
                    m.status = values.status;
                    m.unit = values.unit;
                    m.range = values.range;
                });
            }

            if (result.overrides) {
                const overrides = JSON.parse(result.overrides);
                result.measurements.forEach((m) => {
                    const label = m.label;
                    if (overrides[label]) {
                        m.status = overrides[label].status;
                        m.value = Number.isNaN(parseFloat(overrides[label].value)) ? overrides[label].value : parseFloat(overrides[label].value);
                        m.unit = overrides[label].unit;
                        m.range = overrides[label].range;
                        let minMax;
                        if (m.range.includes("-+")) {
                            minMax = m.range.split("-+").map(parseFloat);
                        } else if (m.range.includes("--")) {
                            minMax = m.range.split("--").map(parseFloat);
                        } else {
                            minMax = m.range.split("-").map(parseFloat);
                        }

                        m.min = minMax[0];
                        m.max = minMax[1];
                    } else {
                        return;
                    }
                });
            }
        }
    });

    return result;
};
