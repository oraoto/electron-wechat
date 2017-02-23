export function objectToArray(obj) {
    let arr = [];
    for (let v of obj) {
        arr.push(v);
    }
    return arr;
}