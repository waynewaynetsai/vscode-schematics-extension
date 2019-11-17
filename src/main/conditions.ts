import { condStrategy, condSwitcher } from "./common/cond";
import { selectOptions, inputDefaultPath } from "./prompt";
import { SchemaDataOptions } from "./model";
import * as vscode from 'vscode';

type OptionsData = {
    setting: SchemaDataOptions;
    item: vscode.QuickPickItem;
};

const pathCond = (path: string) => condStrategy(
    (data: OptionsData) => !!data.setting.format && data.setting.format === 'path',
    (data: OptionsData) => inputDefaultPath(path).then((reply? :string) => !!(reply&&reply.length>0)?`--${data.item.label}=${reply}`:'')
);

const typeBoolCond =  condStrategy(
    (data: OptionsData) => !!data.setting.type && data.setting.type === "boolean",
    (data: OptionsData) => {
        const _prompt = (data.setting["x-prompt"] && data.setting["x-prompt"]!.message) ? data.setting["x-prompt"].message : data.item.description;
        const ret = selectOptions(`enter ${data.item.label} options`, _prompt)(['true', 'false'])
            .then((reply) => (!!reply) ? `--${data.item.label}` : '');
        return ret;
    }
);
const showInputCond =  condStrategy(
    (data: OptionsData) => !!data.setting.type && data.setting.type === "string" && (!data.setting["x-prompt"] || typeof data.setting["x-prompt"] === "string"),
    (data: OptionsData) => {
        const _hintText = `--${data.item.label}`;
        const _prompt = (data.setting["x-prompt"] && data.setting["x-prompt"]!.message) ? data.setting["x-prompt"].message : data.item.description;
        const ret = vscode.window.showInputBox({
            placeHolder: `enter ${data.item.label} value`,
            prompt: _prompt,
            ignoreFocusOut: true,
        } as vscode.InputBoxOptions).then((reply) => `--${data.item.label}=${reply}`);
        return ret;
    }
);

const typeListCond =  condStrategy(
    (data: OptionsData) => !!data.setting["x-prompt"] && !!(data.setting["x-prompt"]!.type) && data.setting["x-prompt"]!.type === "list",
    (data: OptionsData) => {
        const _hintText = `--${data.item.label}`;
        const _prompt = (data.setting["x-prompt"] && data.setting["x-prompt"]!.message) ? data.setting["x-prompt"].message : data.item.description;
        const ret = selectOptions(`enter ${data.item.label} options`, _prompt)(
            (data.setting["x-prompt"]!.items!.map(x => x.label)
            )).then((reply) => `--${data.item.label}=${reply}`);
        return ret;
    }
);

export const condOptions = (path: string) => condSwitcher(
    pathCond(path),
    typeBoolCond,
    showInputCond,
    typeListCond
);