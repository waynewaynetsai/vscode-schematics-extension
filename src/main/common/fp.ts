export const pipe = (...fns: Function[]) => (x?: any) => fns.reduce((accFn, fn) => fn(accFn), x);
export const wait = (fn: Function) => async (valFn: any) => fn(await valFn);
export const catchAsync = (errfn: Function) => async (fn: Promise<any>) => {
	try {
		return await fn;
	} catch (err) {
		errfn(err);
	}
};