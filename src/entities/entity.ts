import AbstractSprite from '../abstracts/abstractsprite';
import BattleInfo from './battleinfo';
import EntityState from './entitystate';
import Equipment from './equipment/equipment';
import StatType from './equipment/stattype';
import IdentifierInfo from './identifierinfo';
import LevelInfo from './levelinfo';

export default class Entity {
    public sprite: AbstractSprite;
    public equipment: Array<Equipment>;
    public hit_by_equipment: Array<string>;
    public hit_by_attack: Array<string>;

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
        this.hit_by_attack = new Array<string>();
        this.hit_by_equipment = new Array<string>();
    }

    public has_equipment(equipment_type: string): boolean {
        return this.equipment.filter(equipment => equipment.type === equipment_type).length > 0;
    }

    public add_equipment(equipment: Equipment, upgrades?: Array<StatType>): void {
        const existing: Equipment = this.equipment.find(inner => inner.key === equipment.key);

        if (existing) {
            existing.equipment_info.level++;
            for (const upgrade of upgrades) {
                existing.upgrades.push(upgrade);
            }

        } else {
            this.equipment.push(equipment);
        }
    }

    public get_equipment_level(equipment_type: string): number {
        const equipment: Equipment = this.equipment.find(equipment => equipment.type === equipment_type);
        if (!equipment) return 0;

        return equipment.level + 1;
    }

    public add_exp(experience: number): void {
        this.level_info.experience += experience;
    }

    public confirm_hit(attack_uid: string, equipment_key?: string): boolean {
        if (this.hit_by_attack.filter(hit => hit === attack_uid).length > 0) return true;
        if (!equipment_key) return false;

        if (this.hit_by_equipment.filter(hit => hit === equipment_key).length > 0) return true;
        return false;
    }

    public register_hit(attack_uid: string, equipment_key: string): void {
        this.hit_by_attack.push(attack_uid);
        this.hit_by_equipment.push(equipment_key);
    }

    public reset_hits(): void {
        this.hit_by_attack = new Array<string>();
        this.hit_by_equipment = new Array<string>();
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