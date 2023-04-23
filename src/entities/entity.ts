import AbstractSprite from '../abstracts/abstractsprite';
import BattleInfo from './battleinfo';
import EntityState from './entitystate';
import Equipment from './equipment/equipment';
import IdentifierInfo from './identifierinfo';
import LevelInfo from './levelinfo';

export default class Entity {
    public sprite: AbstractSprite;
    public equipment: Array<Equipment>;

    public get x(): number {
        return this.sprite.absolute_x;
    }

    public get y(): number {
        return this.sprite.absolute_y;
    }

    public get physics_body(): Phaser.Physics.Matter.Sprite {
        return this.sprite.physics_body;
    }

    public get key(): string {
        return this.identifier_info.key;
    }

    public get sprite_key(): string {
        return this.identifier_info.sprite_key;
    }

    public get power(): number {
        return this.battle_info.power;
    }

    public get alive(): boolean {
        return this.battle_info.alive;
    }

    public get ready(): boolean {
        return this.battle_info.state === EntityState.IDLE;
    }

    constructor(readonly identifier_info: IdentifierInfo, readonly battle_info: BattleInfo, readonly level_info?: LevelInfo) {
        this.equipment = new Array<Equipment>();
    }

    public add_equipment(equipment: Equipment): void {
        const existing: Equipment = this.equipment.find(inner => inner.key === equipment.key);

        if (existing) {
            existing.info.level++;

        } else {
            this.equipment.push(equipment);
        }
    }

    public add_exp(experience: number): void {
        this.level_info.experience += experience;
    }

    public set_state(state: EntityState): void {
        switch (state) {
            case EntityState.IDLE:
                this.sprite.play('idle_' + this.sprite_key);
                break;
            case EntityState.ATTACKING:
                this.sprite.play('active_' + this.sprite_key);
                break;
        }


        this.battle_info.state = state;
    }

    public destroy(): void {
        this.sprite.destroy();
    }
}