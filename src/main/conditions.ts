import { condStrategy, condSwitcher } from "./common/cond";
import { selectOptions, inputDefaultPath } from "./prompt";
import { SchemaDataOptions } from "./model";
import * as vscode from 'vscode';

type OptionsData = {
    setting: SchemaDataOptions;
    item: vscode.QuickPickItem;
};

const getPrompt = (data: OptionsData) => {
    const _promptStr = (typeof data.setting["x-prompt"] === "string") && data.setting["x-prompt"];
    const _promptMsg = (data.setting["x-prompt"] && data.setting["x-prompt"]!.message) && data.setting["x-prompt"].message;
    const _description = data.item.description;
    return _promptStr || _promptMsg || _description;
};

const enumCond = condStrategy(
    (data: OptionsData) => !!data.setting.enum && !(data.setting["x-prompt"] && data.setting["x-prompt"]!.type && data.setting["x-prompt"]!.type === "list"),
    (data: OptionsData) => {
        const _prompt = getPrompt(data);
        return selectOptions(`enter ${data.item.label} options`, _prompt)(data.setting.enum!).then((reply?: string) => `--${data.item.label}=${reply}`);
    });

const pathCond = (path: string) => condStrategy(
    (data: OptionsData) => !!data.setting.format && data.setting.format === 'path',
    (data: OptionsData) => inputDefaultPath(path).then((reply?: string) => !!(reply && reply.length > 0) ? `--${data.item.label}=${reply}` : '')
);

const typeNumberCond = condStrategy(
    (data: OptionsData) => !!data.setting.type && data.setting.type === "number",
    (data: OptionsData) => {
        const _prompt = getPrompt(data);
        const ret = vscode.window.showInputBox({
            placeHolder: `enter ${data.item.label} number`,
            prompt: _prompt,
            ignoreFocusOut: true,
        } as vscode.InputBoxOptions).then((reply) => `--${data.item.label}=${reply}`);
        return ret;
    }
);

const typeIntegerCond = condStrategy(
    (data: OptionsData) => !!data.setting.type && data.setting.type === "integer",
    (data: OptionsData) => {
        const _prompt = getPrompt(data);
        const ret = vscode.window.showInputBox({
            placeHolder: `enter ${data.item.label} integer`,
            prompt: _prompt,
            ignoreFocusOut: true,
        } as vscode.InputBoxOptions).then((reply) => `--${data.item.label}=${reply}`);
        return ret;
    }
);

const typeBoolCond = condStrategy(
    (data: OptionsData) => !!data.setting.type && data.setting.type === "boolean",
    (data: OptionsData) => {
        const _prompt = getPrompt(data);
        const ret = selectOptions(`enter ${data.item.label} options`, _prompt)(['true', 'false'])
            .then((reply) => (!!reply) ? `--${data.item.label}` : '');
        return ret;
    }
);

const typeStringCond = condStrategy(
    (data: OptionsData) => !!data.setting.type && data.setting.type === "string" && (!data.setting["x-prompt"] || typeof data.setting["x-prompt"] === "string"),
    (data: OptionsData) => {
        const _prompt = getPrompt(data);
        const ret = vscode.window.showInputBox({
            placeHolder: `enter ${data.item.label} value`,
            prompt: _prompt,
            value: data.setting.default || '',
            valueSelection: !!data.setting.default ? [(data.setting.default as string).length, (data.setting.default as string).length] : [],
            ignoreFocusOut: true,
        } as vscode.InputBoxOptions).then((reply) => `--${data.item.label}=${reply}`);
        return ret;
    }
);

const xpromptListCond = condStrategy(
    (data: OptionsData) => !!data.setting["x-prompt"] && !!data.setting["x-prompt"]!.type && data.setting["x-prompt"]!.type === "list",
    (data: OptionsData) => {
        const _prompt = getPrompt(data);
        const ret = selectOptions(`enter ${data.item.label} options`, _prompt)(
            (data.setting["x-prompt"]!.items!.map(x => x.label)
            )).then((reply) => `--${data.item.label}=${reply}`);
        return ret;
    }
);

const xpromptInputCond = condStrategy(
    (data: OptionsData) => !!data.setting["x-prompt"] && !!data.setting["x-prompt"]!.type && data.setting["x-prompt"]!.type === "input",
    (data: OptionsData) => {
        const _prompt = getPrompt(data);
        const ret = vscode.window.showInputBox({
            value: data.setting.default || '',
            valueSelection: !!data.setting.default ? [(data.setting.default as string).length, (data.setting.default as string).length] : [],
            placeHolder: `enter ${data.item.label} value`,
            prompt: _prompt,
            ignoreFocusOut: true,
        } as vscode.InputBoxOptions).then((reply) => `--${data.item.label}=${reply}`);
        return ret;
    }
);

const xpromptBoolCond = condStrategy(
    (data: OptionsData) => !!data.setting["x-prompt"] && !!data.setting["x-prompt"]!.type && data.setting["x-prompt"]!.type === "confirmation",
    (data: OptionsData) => {
        const _prompt = getPrompt(data);
        const ret = selectOptions(`enter ${data.item.label} options`, _prompt)(['true', 'false'])
            .then((reply) => (!!reply) ? `--${data.item.label}` : '');
        return ret;
    }
);

export const condOptions = (path: string) => condSwitcher(
    enumCond,
    pathCond(path),
    typeBoolCond,
    typeNumberCond,
    typeIntegerCond,
    typeStringCond,
    xpromptListCond,
    xpromptBoolCond,
    xpromptInputCond
);