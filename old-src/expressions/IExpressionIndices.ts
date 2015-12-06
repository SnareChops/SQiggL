interface IExpressionIndices {
    [key: string]: (number[] | number | string);
    [key: number]: string | number | number[];
}
export default IExpressionIndices;