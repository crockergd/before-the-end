import AbstractSprite from '../../abstracts/abstractsprite';

export default class Attack {
    public sprite: AbstractSprite;

    public get physics_body(): Phaser.Physics.Matter.Sprite {
        return this.sprite.physics_body;
    }

    constructor(readonly power: number) {

    }

    public destroy(): void {
        this.sprite.destroy();
        this.sprite = null;
    }
}