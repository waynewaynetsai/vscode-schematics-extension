export interface SchemaDataDefaultOption {
    $source: 'argv' | 'projectName';
    index?: number;
}

export interface SchemaDataOptions {
    type: 'string' | 'boolean' | 'array';
    description: string;
    format?: string;
    enum?: string[];
    visible?: boolean;
    default?: string | boolean;
    $default?: SchemaDataDefaultOption;
    extends?: string;
    'x-deprecated'?: string;
    'x-prompt'?: {
        message?: string;
        multiselect?: boolean;
        items?: any[];
        type? : string;
    };
}

export interface SchemaData {
    properties: {
        [key: string]: SchemaDataOptions;
    };
    required?: string[];
}