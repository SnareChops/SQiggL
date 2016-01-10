/**
 * Creates a new SQiggL Error
 *
 * @internal
 * @param code {string} - The code of the error.
 * @param message {string} - The message of the error.
 * @returns {Error} - A Javascript error object.
 */
export function SQiggLError(code: string, message: string){
    return new Error(`SQiggLError - ${code}: ${message}`);
}