
export function delayAsync(milliseconds: number): Promise<void> {

    let promise = new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);    
    });

    return promise;
}
