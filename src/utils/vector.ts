export default class Vector {
    public x: number;
    public y: number;
    public z?: number;
    public w?: number;

    public get width(): number {
        return this.x;
    }

    public get height(): number {
        return this.y;
    }

    public get magnitude(): number {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    public get pv2(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.x, this.y);
    }

    constructor(x: number, y: number, z?: number, w?: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public multiply(value: number): Vector {
        this.x *= value;
        this.y *= value;
        return this;
    }

    public normalize(): Vector {
        this.x /= this.magnitude;
        this.y /= this.magnitude;
        return this;
    }

    public static equal(lhs: Vector, x: number, y: number, z?: number, w?: number): boolean {
        return lhs.x === x && lhs.y === y && (!z || lhs.z === z) && (!w || lhs.w === w);
    }

    public static equal_v(lhs: Vector, v: Vector): boolean {
        return Vector.equal(lhs, v.x, v.y, v.z, v.w);
    }

    public static copy(vector: Vector): Vector {
        return new Vector(vector.x, vector.y, vector.z, vector.w);
    }

    public static cardinals(vector: Vector): Array<Vector> {
        return [
            new Vector(vector.x, vector.y - 1),
            new Vector(vector.x + 1, vector.y),
            new Vector(vector.x, vector.y + 1),
            new Vector(vector.x - 1, vector.y)
        ];
    }

    public static positions(vector: Vector): Array<Vector> {
        return [
            new Vector(vector.x, vector.y - 1),
            new Vector(vector.x + 1, vector.y - 1),
            new Vector(vector.x + 1, vector.y),
            new Vector(vector.x + 1, vector.y + 1),
            new Vector(vector.x, vector.y + 1),
            new Vector(vector.x - 1, vector.y + 1),
            new Vector(vector.x - 1, vector.y),
            new Vector(vector.x - 1, vector.y - 1)
        ];
    }
}