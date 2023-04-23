import AbstractSprite from '../../abstracts/abstractsprite';

export default class Attack {
    public sprite: AbstractSprite;
    public latch: boolean;
    public chain: number;

    public get physics_body(): Phaser.Physics.Matter.Sprite {
        return this.sprite.physics_body;
    }

    constructor(readonly power: number) {
        this.latch = false;
        this.chain = 0;
    }

    public destroy(): void {
        this.sprite.destroy();
        this.sprite = null;
    }
}