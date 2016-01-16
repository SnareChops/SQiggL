/**
 * Creates a new SQiggL Error
 *
 * @internal
 * @param code {string} - The code of the error.
 * @param message {string} - The message of the error.
 * @param bug {boolean} - If true appends message with notice to create an issue with repro.
 * @returns {Error} - A Javascript error object.
 */
export function SQiggLError(code: string, message: string, bug: boolean = false){
    if(!bug) return new Error(`SQiggLError - ${code}: ${message}`);
    return new Error(`SQiggLError - ${code}: ${message}. This is most likely a bug in SQiggL itself. Please create an issue at github.com/SnareChops/SQiggL/issues with this message and an example query that produces this error.`);
}