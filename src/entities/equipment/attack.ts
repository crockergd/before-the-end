import AbstractSprite from '../../abstracts/abstractsprite';
import AttackInfo from './attackinfo';

export default class Attack {
    public sprite: AbstractSprite;
    public constraint: MatterJS.ConstraintType;

    public get physics_body(): Phaser.Physics.Matter.Sprite {
        return this.sprite.physics_body;
    }

    public get uid(): string {
        return this.sprite.uid;
    }

    constructor(readonly attack_info: AttackInfo) {

    }

    public destroy(): void {
        this.sprite.destroy();
        this.sprite = null;
    }
}