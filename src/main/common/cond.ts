type CondStrategy = {
    predict: (data: any) => boolean; 
    handle: Function;
};

export const condStrategy = (predictFn: (data: any) => boolean, handleFn: Function) => ({ 
    predict: predictFn,
    handle: handleFn
});

export const condSwitcher = (...conds: CondStrategy[]) => async (input: any) => {
    try {
        const strategy = conds.filter((s: CondStrategy) => s.predict(input));
        return ( strategy.length > 0 )? await strategy[0].handle(input) : false;
    } catch (error) {
        console.log('CondSwitch Error', error.toString());
    }
};