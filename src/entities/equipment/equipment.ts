export default abstract class Equipment {
    public level: number;

    public abstract attack(): void;

    constructor() {
        this.level = 0;
    }
}