
export interface IProgram {
    setup(): Promise<void> | void;
    loop(): Promise<boolean> | boolean | void;
}

class ProgramRunner {
    async Run(program: IProgram) {
        let continueRun = true;

        try {
            await program.setup();
        } catch (e: any) {
            console.error("UNCAUGHT ERROR in setup(): ", e);
            return;
        }

        try {
            while (continueRun) {
                continueRun = (await program.loop()) !== false;
            }
        } catch (e: any) {
            console.error("UNCAUGHT ERROR in loop(): ", e);
            return;
        }
    }
}

export const programRunner = new ProgramRunner();