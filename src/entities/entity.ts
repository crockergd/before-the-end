import AbstractSprite from '../abstracts/abstractsprite';
import BattleInfo from './battleinfo';
import IdentifierInfo from './identifierinfo';

export default class Entity {
    public sprite: AbstractSprite;

    public get x(): number {
        return this.sprite.absolute_x;
    }

    public get y(): number {
        return this.sprite.absolute_y;
    }

    public get physics(): Phaser.Physics.Matter.Sprite {
        return this.sprite.physics_body;
    }

    public get sprite_key(): string {
        return this.identifier_info.sprite_key;
    }

    public get power(): number {
        return this.battle_info.power;
    }

    constructor(readonly identifier_info: IdentifierInfo, readonly battle_info: BattleInfo) {

    }

    public destroy(): void {
        this.battle_info.alive = false;
        this.sprite.destroy();
    }
}