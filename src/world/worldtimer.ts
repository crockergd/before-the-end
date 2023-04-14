export default class WorldTimer {
    public expiry_time: number;
    public elapsed_time: number;
    public difficulty_scalar: number;

    public get remaining(): number {
        return this.expiry_time;
    }

    constructor(readonly start_time: number) {
        this.expiry_time = 30;
        this.elapsed_time = 0;
        this.difficulty_scalar = 1;
    }

    public update(dt: number): boolean {
        this.expiry_time -= (dt * this.difficulty_scalar);
        this.elapsed_time += dt;

        return this.expiry_time > 0;
    }

    public extend_time(value: number): void {
        this.expiry_time += value;
    }
}