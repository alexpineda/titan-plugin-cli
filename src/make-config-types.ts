export type FieldDefinition<T = unknown> = {
    /**
     * The type is usually inferred except for the case of Leva Plugins.
     */
    type?: string;
    folder?: string;
    label?: string;
    value: T; //number | string | boolean | number[];
    step?: number;
    min?: number;
    max?: number;
    options?: string[] | Record<string, string>;
}

const _getValueType = (value: any) => {
    if (Array.isArray(value)) {
        return typeof value[0];
    } else {
        return typeof value;
    }
}

const _makeConfigScheme = (config: any, version: string) => {
    let result = `export interface ConfigSchema${version.replace(/[^0-9]/g, "_")} {\n`;

    for (const key in config) {
        const value = config[key] as FieldDefinition
        result += `${key}: {\n`;
        if (value.type) {
            result += `type: "${value.type}";\n`;
        }
        if (value.folder) {
            result += `folder: string;\n`;
        }
        if (value.label) {
            result += `label: string;\n`;
        }
        if (value.step) {
            result += `step: number;\n`;
        }
        if (value.min) {
            result += `min: number;\n`;
        }
        if (value.max) {
            result += `max: number;\n`;
        }
        if (value.options) {
            result += `options: ${Array.isArray(value.options) ? "string[]" : "Record<string, string>"};\n`;
        }
        result += `value: ${_getValueType(value.value)};\n`;
        result += `};\n`;

    }

    result += "}\n";
    return result;
}

const _makeConfigValues = (config: any, version: string) => {
    let result = `export interface Config${version.replace(/[^0-9]/g, "_")} {\n`;

    for (const key in config) {
        const value = config[key].value;
        result += `${key}: ${_getValueType(value)};\n`;
    }

    result += "}\n";
    return result;
}

export const makeConfigTypes = (config: any, version: string) => {
    return _makeConfigScheme(config, version) + _makeConfigValues(config, version);
}