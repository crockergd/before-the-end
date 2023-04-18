import AbstractSprite from '../abstracts/abstractsprite';

export default class ExpDrop {
    public sprite: AbstractSprite;
    public collected: boolean;
    public absorbed: boolean;

    constructor() {
        this.collected = false;
        this.absorbed = false;
    }
}