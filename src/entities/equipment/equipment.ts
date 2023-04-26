import RenderContext from '../../contexts/rendercontext';
import Main from '../../scenes/main';
import MainPhysics from '../../scenes/mainphysics';
import MainRenderer from '../../scenes/mainrenderer';
import Vector from '../../utils/vector';
import Entity from '../entity';
import AttackInfo from './attackinfo';
import EquipmentInfo from './equipmentinfo';
import StatType from './stattype';

export default abstract class Equipment {
    public type: string;
    public equipment_info: EquipmentInfo;
    public attack_info: AttackInfo;
    public upgrades: Array<StatType>;

    public get scene_renderer(): MainRenderer {
        return this.scene.scene_renderer;
    }

    public get scene_physics(): MainPhysics {
        return this.scene.scene_physics;
    }

    public get level(): number {
        return this.equipment_info.level;
    }

    public get key(): string {
        return this.equipment_info.key;
    }

    public abstract attack(player: Entity, target: Vector): void;
    public abstract apply_scaling(): void;

    constructor(readonly scene: Main, readonly render_context: RenderContext) {
        this.type = 'Equipment';
        this.upgrades = new Array<StatType>();
    }

    public apply_player_scaling(player: Entity): void {
        this.attack_info.power += player.power;
        this.attack_info.repeat += player.battle_info.repeat;
        this.attack_info.amount += player.battle_info.amount;
    }
}