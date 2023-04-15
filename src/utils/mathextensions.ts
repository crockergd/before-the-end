import Vector from './vector';

export default class MathExtensions {
    public static random(deterministic: boolean): number {
        return Math.random();
    }

    /**
     * Returns a random inclusive integer
     * @param min - Minimum possible value
     * @param max - Maximum possible value
     */
    public static rand_int_inclusive(min: number, max: number, unseeded?: boolean, deterministic?: boolean): number {
        const rand: number = unseeded ? Math.random() : MathExtensions.random(deterministic ?? false);
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(rand * (max - min + 1)) + min;
    }

    public static rand_indices(array: Array<any>, count: number): Array<number> {
        const valid: boolean = (count <= array.length);

        const indices: Array<number> = new Array<number>();
        for (let i: number = 0; i < count; i++) {
            let random_index: number;
            if (valid) {
                do {
                    random_index = MathExtensions.rand_int_inclusive(0, array.length - 1);
                } while (indices.find(unique_index => unique_index === random_index) !== undefined);
            } else {
                random_index = MathExtensions.rand_int_inclusive(0, array.length - 1);
            }

            indices.push(random_index);
        }
        return indices;
    }

    /**
     * Returns a random boolean value, defaulting to 50/50
     * @param ratio - Probability of returning true
     */
    public static coin_flip(ratio?: number, deterministic?: boolean): boolean {
        if (ratio !== 0) ratio = ratio || 0.5;
        const rand: number = MathExtensions.random(deterministic ?? false); // Math.random();
        return rand < ratio;
    }

    public static vary_percentage(base_amount: number, variable_percentage: number, deterministic?: boolean): number {
        let variable_amount: number = Math.round(base_amount * variable_percentage);
        let varied_amount: number = MathExtensions.rand_int_inclusive(0, variable_amount * 2, undefined, deterministic);
        let total: number = base_amount + varied_amount - variable_amount;
        let smoothed: number = MathExtensions.smooth(total);

        return smoothed;
    }

    public static raise_percentage(base_amount: number, variable_percentage: number): number {
        return MathExtensions.random(false) * (base_amount * variable_percentage);
    }

    public static to_percentage(value: number, extent: number): number {
        if (value) {
            return value / extent;
        } else {
            value = Math.abs(value);
            return value / extent;
        }
    }

    public static floor_ceil(value: number, floor: boolean): number {
        if (floor) {
            return Math.floor(value);
        } else {
            return Math.ceil(value);
        }
    }

    public static rand_weighted(deterministic: boolean, ...weights: Array<number>): number {
        let sum: number = weights.reduce((acc, val) => {
            return acc + val;
        }, 0);
        const rand: number = MathExtensions.random(deterministic) * sum;

        let acc: number = 0;
        let index: number = 0;
        for (const weight of weights) {
            acc += weight;
            if (rand < acc) return index;
            index++;
        }

        return weights.length - 1;
    }

    public static clamp(value: number, min: number, max: number): number {
        return value <= min ? min : value >= max ? max : value;
    }

    public static diff(lhs: number, rhs: number): number {
        return Math.max(lhs, rhs) - Math.min(lhs, rhs);
    }

    public static round_to(value: number, clamp: number, mod: number = 0.5): number {
        let divisor: number = value / clamp;
        const remainder: number = (divisor - Math.floor(divisor));
        if (remainder > mod) {
            divisor = Math.ceil(divisor);
        } else {
            divisor = Math.floor(divisor);
        }
        const final: number = (divisor * clamp);

        return final;
    }

    public static floor_to(value: number, clamp: number): number {
        let divisor: number = value / clamp;
        divisor = Math.floor(divisor);
        const final: number = (divisor * clamp);
        return final;
    }

    public static vector_to_degrees(value: Vector): number {
        const radians: number = Math.atan2(value.y, value.x);
        let degrees: number = radians * (180 / Math.PI);

        if (degrees < 0) {
            degrees += 360;
        }

        return degrees;
    }

    public static within_range(value: number, comparison: number, range: number): boolean {
        if (comparison > value && value + range >= comparison) {
            return true;
        } else if (value > comparison && value - range <= comparison) {
            return true;
        } else if (value === comparison) {
            return true;
        }

        return false;
    }

    public static within_bounds(x: number, y: number, bounds: Vector, inclusive: boolean): boolean {
        if (inclusive) {
            if (x < bounds.x || x > bounds.z) return false;
            if (y < bounds.y || y > bounds.w) return false;

        } else {
            if (x < bounds.x || x >= bounds.z) return false;
            if (y < bounds.y || y >= bounds.w) return false;
        }

        return true;
    }

    public static push_bounds(bounds: Vector, point: Vector): Vector {
        if (bounds.x > point.x) {
            bounds.x = point.x;
        }
        if (bounds.y > point.y) {
            bounds.y = point.y;
        }
        if (bounds.z < point.x) {
            bounds.z = point.x;
        }
        if (bounds.w < point.y) {
            bounds.w = point.y;
        }

        return bounds;
    }

    public static expand_bounds(bounds: Vector, value: number): Vector {
        const expansion: Vector = new Vector(bounds.x, bounds.y, bounds.z, bounds.w);

        expansion.x -= value;
        expansion.x = Math.max(expansion.x, 0);

        expansion.y -= value;
        expansion.y = Math.max(expansion.y, 0);

        expansion.z += value;
        expansion.w += value;

        return expansion;
    }

    public static points_to_bounds(points: Array<Vector>): Vector {
        const bounds: Vector = new Vector(9999, 9999, 0, 0);

        for (const point of points) {
            bounds.x = Math.min(bounds.x, point.x);
            bounds.y = Math.min(bounds.y, point.y);
            bounds.z = Math.max(bounds.z, point.x);
            bounds.w = Math.max(bounds.w, point.y);
        }

        return bounds;
    }

    public static normalize_bounds(bounds: Vector, buffer: number = 0): Vector {
        const adjustments: Vector = new Vector(0, 0);

        const baseline_x: number = buffer; // minimum viable x value
        const baseline_y: number = buffer; // minimum viable y value

        if (bounds.x > baseline_x) {
            adjustments.x = -(bounds.x - baseline_x);
            bounds.x += adjustments.x;
            bounds.z += adjustments.x;
        } else if (bounds.x < baseline_x) {
            adjustments.x = Math.max(bounds.x, baseline_x) - Math.min(bounds.x, baseline_x);
            bounds.x += adjustments.x;
            bounds.z += adjustments.x;
        }

        if (bounds.y > baseline_y) {
            adjustments.y = -(bounds.y - baseline_y);
            bounds.y += adjustments.y;
            bounds.w += adjustments.y;
        } else if (bounds.y < baseline_y) {
            adjustments.y = Math.max(bounds.y, baseline_y) - Math.min(bounds.y, baseline_y);
            bounds.y += adjustments.y;
            bounds.w += adjustments.y;
        }

        bounds.x -= baseline_x;
        bounds.y -= baseline_y;
        bounds.z += baseline_x;
        bounds.w += baseline_y;

        return adjustments;
    }

    public static array_sum(array: Array<number>): number {
        return array.reduce((acc, val) => {
            return acc + val;
        }, 0);
    }

    public static array_min(array: Array<number>): number {
        let min: number = Number.MAX_SAFE_INTEGER;
        for (const value of array) {
            min = Math.min(min, value);
        }
        return min;
    }

    public static array_min_index(array: Array<number>): number {
        let min: number = Number.MAX_SAFE_INTEGER;
        let index: number = 0;
        for (let i: number = 0; i < array.length; i++) {
            const element: number = array[i];
            if (element < min) {
                min = element;
                index = i;
            }
        }

        return index;
    }

    public static array_max(array: Array<number>): number {
        let max: number = 0;
        for (const value of array) {
            max = Math.max(max, value);
        }
        return max;
    }

    public static array_max_index(array: Array<number>): number {
        let max: number = 0;
        let index: number = 0;
        for (let i: number = 0; i < array.length; i++) {
            const element: number = array[i];
            if (element > max) {
                max = element;
                index = i;
            }
        }

        return index;
    }

    public static array_rand<Type>(array: Array<Type>): Type {
        return array[MathExtensions.rand_int_inclusive(0, array.length - 1)];
    }

    public static dec_to_hex(value: number): string {
        let hex: string = value.toString(16);
        if (hex.length < 2) hex = '0' + hex;
        return hex;
    }

    public static add_wrap(source: number, value: number, lower_bound: number, upper_bound: number): number {
        if (!value) return source;
        if (lower_bound === upper_bound) return source;

        if (value > 0) {
            for (let i: number = 0; i < value; i++) {
                if (source < upper_bound) source++;
                else source = lower_bound;
            }
        } else {
            for (let i: number = 0; i > value; i--) {
                if (source > lower_bound) source--;
                else source = upper_bound;
            }
        }

        return source;
    }

    public static distance(lhs: Vector, rhs: Vector): number {
        // const x_dist: number = (lhs.x + rhs.x) / 2;
        // const y_dist: number = (lhs.y + rhs.y) / 2;
        // const dist: number = (x_dist + y_dist) / 2;
        // return Math.max(x_dist, y_dist);

        return Math.sqrt(Math.pow(rhs.x - lhs.x, 2) + Math.pow(rhs.y - lhs.y, 2));
    }

    public static follow_normal(point: Vector, normal: Vector, value: number = 1): Vector {
        if (!point || !normal) return null;
        return new Vector(point.x + (normal.x * value), point.y + (normal.y * value));
    }

    public static between(lhs: Vector, rhs: Vector): Vector {
        const between: Vector = new Vector(0, 0);
        between.x = (lhs.x + rhs.x) / 2;
        between.y = (lhs.y + rhs.y) / 2;
        return between;
    }

    public static smooth(value: number): number {
        return Math.floor(value);
    }

    public static bounds_to_points(box: Vector): Array<Vector> {
        let points: Array<Vector> = new Array<Vector>();

        for (let x: number = box.x; x < box.z; x++) {
            for (let y: number = box.y; y < box.w; y++) {
                points.push(new Vector(x, y));
            }
        }

        return points;
    }

    public static bounds_to_rectangle(bounds: Vector): Array<Vector> {
        let points: Array<Vector> = new Array<Vector>();

        points = points.concat(MathExtensions.bresenham(new Vector(bounds.x, bounds.y), new Vector(bounds.z, bounds.y)));
        points = points.concat(MathExtensions.bresenham(new Vector(bounds.x, bounds.y), new Vector(bounds.x, bounds.w)));
        points = points.concat(MathExtensions.bresenham(new Vector(bounds.x, bounds.w), new Vector(bounds.z, bounds.w)));
        points = points.concat(MathExtensions.bresenham(new Vector(bounds.z, bounds.y), new Vector(bounds.z, bounds.w)));

        return points;
    }

    public static points_to_lines(p0: Vector, p1: Vector, p2: Vector, p3: Vector): Array<Vector> {
        let points: Array<Vector> = new Array<Vector>();

        points = points.concat(MathExtensions.bresenham(new Vector(p0.x, p0.y), new Vector(p1.x, p1.y)));
        points = points.concat(MathExtensions.bresenham(new Vector(p1.x, p1.y), new Vector(p2.x, p2.y)));
        points = points.concat(MathExtensions.bresenham(new Vector(p2.x, p2.y), new Vector(p3.x, p3.y)));
        points = points.concat(MathExtensions.bresenham(new Vector(p3.x, p3.y), new Vector(p0.x, p0.y)));

        return points;
    }

    public static translate_points(points: Array<Vector>, translation: Vector): void {
        for (const point of points) {
            point.x += translation.x;
            point.y += translation.y;
        }
    }

    public static rand_within_bounds(bounds: Vector): Vector {
        const rand: number = MathExtensions.random(false);

        if (rand > 0.75) {
            return new Vector(MathExtensions.rand_int_inclusive(bounds.x, bounds.z), bounds.y);
        } else if (rand > 0.5) {
            return new Vector(bounds.z, MathExtensions.rand_int_inclusive(bounds.y, bounds.w));
        } else if (rand > 0.25) {
            return new Vector(MathExtensions.rand_int_inclusive(bounds.x, bounds.z), bounds.w);
        } else {
            return new Vector(bounds.x, MathExtensions.rand_int_inclusive(bounds.y, bounds.w));
        }
    }

    public static opposite_within_bounds(point: Vector, bounds: Vector): Vector {
        if (point.y === bounds.y) {
            return new Vector(bounds.z - point.x, bounds.w);
        } else if (point.x === bounds.z) {
            return new Vector(bounds.x, bounds.w - point.y);
        } else if (point.y === bounds.w) {
            return new Vector(bounds.z - point.x, bounds.y);
        } else {
            return new Vector(bounds.z, bounds.w - point.y);
        }
    }

    public static bresenham(p0: Vector, p1: Vector): Array<Vector> {
        const points: Array<Vector> = new Array<Vector>();

        let dx: number = p1.x - p0.x;
        let dy: number = p1.y - p0.y;

        let adx: number = Math.abs(dx);
        let ady: number = Math.abs(dy);

        let eps: number = 0;

        let sx: number = dx > 0 ? 1 : -1;
        let sy: number = dy > 0 ? 1 : -1;

        if (adx > ady) {
            for (let x: number = p0.x, y: number = p0.y; sx < 0 ? x >= p1.x : x <= p1.x; x += sx) {
                points.push(new Vector(x, y));
                eps += ady;
                if ((eps << 1) >= adx) {
                    y += sy;
                    eps -= adx;
                }
            }

        } else {
            for (let x: number = p0.x, y = p0.y; sy < 0 ? y >= p1.y : y <= p1.y; y += sy) {
                points.push(new Vector(x, y));
                eps += adx;
                if ((eps << 1) >= ady) {
                    x += sx;
                    eps -= ady;
                }
            }
        }

        return points;
    }

    public static segment(p0: Vector, p1: Vector, right: boolean): Vector {
        if (right) {
            return new Vector(p1.x, p0.y);
        } else {
            return new Vector(p0.x, p1.y);
        }
    }

    public static segmented_bresenham(p0: Vector, p1: Vector, segments: number, right: boolean, segy_adjust: number): Array<Vector> {
        let points: Array<Vector> = new Array<Vector>();

        if (segments === 1) {
            let pc: Vector = new Vector(p1.x, p0.y);
            if (right) {
                pc = new Vector(p1.x, p0.y);
            } else {
                pc = new Vector(p0.x, p1.y);
            }
            points = points.concat(MathExtensions.bresenham(p0, pc));
            points = points.concat(MathExtensions.bresenham(pc, p1));

        } else if (segments === 2) {
            let seg0: Vector;
            let seg1: Vector;

            if (right) {
                const segx: number = Math.floor(p0.x + ((p1.x - p0.x) / 2)); // + MathExtensions.rand_int_inclusive(1, 2);
                seg0 = new Vector(segx, p0.y);
                seg1 = new Vector(segx, p1.y);

            } else {
                const segy: number = Math.floor(p0.y + ((p1.y - p0.y) / 2)) + segy_adjust;
                seg0 = new Vector(p0.x, segy);
                seg1 = new Vector(p1.x, segy);
            }

            points = points.concat(MathExtensions.bresenham(p0, seg0));
            points = points.concat(MathExtensions.bresenham(seg0, seg1));
            points = points.concat(MathExtensions.bresenham(seg1, p1));
        }

        return points;
    }
}