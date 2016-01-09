export function SQiggLError(code: string, message: string){
    return new Error(`SQiggLError - ${code}: ${message}`);
}