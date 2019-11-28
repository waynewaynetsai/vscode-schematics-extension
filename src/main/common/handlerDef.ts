import { isFunction } from "./utils";

class HandlerBuilder {
    private isActionVoid = false;
    private predictFn = (data: any) => true;
    private handleFn!: Function;
    constructor() {
    }
    setPredictor(predicate: (data: any) => boolean) {
        this.predictFn = predicate;
        return this;
    }
    setAction(handleFn: Function, isVoid = false) {
        this.handleFn = handleFn;
        this.isActionVoid = isVoid;
        return this;
    }
    setActionVoid(bool: boolean) {
        this.isActionVoid = bool;
        return this;
    }
    build() {
        if (!isFunction(this.handleFn)) {
            throw new TypeError('Handler Must set handle action function!');
        }
        return new Handler(this.predictFn, this.handleFn, this.isActionVoid);
    }
}

export class Handler {
    nextHandler: Handler | null = null;
    private isActionVoid: Boolean;
    private predicateFn: (data: any) => boolean;
    private handleFn: Function;
    constructor(predicateFn: (data: any) => boolean, handleFn: Function, isActionVoid: boolean) {
        this.predicateFn = predicateFn;
        this.handleFn = handleFn;
        this.isActionVoid = isActionVoid;
    }
    private predicate(data: any) {
        return this.predicateFn(data);
    }
    async handle(data: any) {
        if (this.isActionVoid) {
            this.next(data);
        } else {
            const ret = await this.handleFn(data);
            if (ret) {
                this.next(ret);
            }
        }
    }
    private next(requestData: any) {
        // tslint:disable-next-line: no-unused-expression
        (this.nextHandler !== null) ? this.nextHandler.dispatch(requestData) : null;
    }
    private dispatch(reqData: any) {
        (this.predicate(reqData)) ? this.handle(reqData) : this.next(reqData);
    }
    then(handler: Handler) {
        this.nextHandler = handler;
        return this.nextHandler;
    }
    async passRequest(reqData: any) {
        this.dispatch(reqData);
    }
}

class Chainer {
    private handlers: Handler[];
    constructor(...handlers: (Handler | HandlerFactory | Chainer)[]) {
        if (!handlers.length || handlers.length < 2) {
            throw TypeError('Chainer constructor must setup more than two handlers or Chainers!');
        }
        this.handlers = [...handlers]
            .map((x: HandlerFactory | Handler | Chainer ) => {
                if ((x as Chainer).handlers) {
                    return [...(x as Chainer).handlers];
                }
                return isFunction(x) ? (x as HandlerFactory)() : x as Handler;
            })
            .reduce((acc: Handler[], curr: Handler | Handler[]) => acc.concat(curr), []);
        this.binding();
    }
    private binding() {
        this.handlers.reduce((prev: Handler, curr: Handler) => prev.then(curr));
    }
    handle(data: any) {
        return this.handlers[0].passRequest(data);
    }
}

export type HandlerFactory = (...fns: Function[]) => Handler;

export const handlerBuilder = () => new HandlerBuilder();

export const chain = (...handlersOrChainer: (Handler | HandlerFactory | Chainer)[]) => new Chainer(...handlersOrChainer);

export const actionHandler = (action: Function) => () => handlerBuilder()
    .setAction(action)
    .build();
export const voidActionHandler = (action: Function) => () => handlerBuilder()
    .setActionVoid(true)
    .setAction(action)
    .build();
export const actionCondHandler = (predicate: (data: any) => boolean, action: Function) => () => handlerBuilder()
    .setPredictor(predicate)
    .setAction(action)
    .build();
export const voidActionCondHandler = (predicate: (data: any) => boolean, action: Function) => () => handlerBuilder()
    .setActionVoid(true)    
    .setPredictor(predicate)
    .setAction(action)
    .build();

    