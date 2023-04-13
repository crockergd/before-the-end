import MathExtensions from './mathextensions';

export default abstract class ObjectExtensions {
    public static clone<T>(source: T): any {
        if (Array.isArray(source)) {
            const array: Array<T> = new Array<T>();
            for (const obj of source) {
                array.push(Object.assign({}, obj));
            }

            return array;
        } else {
            const obj: T = Object.assign({}, source);
            return obj;
        }
    }

    public static array_rand<T>(array: Array<T>): T {
        return array[MathExtensions.rand_int_inclusive(0, array.length - 1)];
    }

    public static array_access<T>(array: Array<T>, index: number): T {
        if (!array) return null;
        if (index < 0) index = index + (array.length);
        if (!(array.length > index)) return null;

        return array[index];
    }

    // grabs only specified properties from each element of array
    public static array_pick<T>(array: Array<T>, picked: Array<string>): Array<T> {
        const resolved: Array<any> = array.map(obj => Object.fromEntries(Object.entries(obj).filter(entry => picked.find(trim => trim === entry[0]))));
        return resolved;
    }

    // removes specified properties from each element of array
    public static array_trim<T>(array: Array<T>, trimmed: Array<string>): Array<T> {
        const resolved: Array<any> = array.map(obj => Object.fromEntries(Object.entries(obj).filter(entry => !trimmed.find(trim => trim === entry[0]))));
        return resolved;
    }

    public static array_unique(array: Array<any>): Array<any> {
        return Array.from(new Set(array));
    }

    public static array_flat(array: Array<any>): Array<any> {
        return [].concat(...array);
    }

    public static exists(value: any): boolean {
        if (value === null || value === undefined) return false;
        return true;
    }

    public static now(): number {
        return new Date().getTime();
    }
}