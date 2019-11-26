export interface SchemaDataDefaultOption {
    $source: 'argv' | 'projectName';
    index?: number;
}

export interface SchemaDataOptions {
    type: 'string' | 'boolean' | 'number' | 'integer';
    description: string;
    format?: string;
    enum?: string[];
    visible?: boolean;
    default?: string | boolean | number;
    $default?: SchemaDataDefaultOption;
    extends?: string;
    'x-deprecated'?: string;
    'x-prompt'?: {
        message?: string;
        multiselect?: boolean;
        items?: any[];
        type? : 'confirmation' | 'input' | 'list';
    };
}

export interface SchemaData {
    properties: {
        [key: string]: SchemaDataOptions;
    };
    required?: string[];
}