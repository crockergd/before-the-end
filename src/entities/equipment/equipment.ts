import RenderContext from '../../contexts/rendercontext';
import Main from '../../scenes/main';
import MainPhysics from '../../scenes/mainphysics';
import MainRenderer from '../../scenes/mainrenderer';
import Entity from '../entity';
import EquipmentInfo from './equipmentinfo';

export default abstract class Equipment {
    public type: string;
    public info: EquipmentInfo;
    public power: number;

    public get scene_renderer(): MainRenderer {
        return this.scene.scene_renderer;
    }

    public get scene_physics(): MainPhysics {
        return this.scene.scene_physics;
    }

    public get level(): number {
        return this.info.level;
    }

    public get key(): string {
        return this.info.key;
    }

    public abstract attack(player: Entity): void;

    constructor(readonly scene: Main, readonly render_context: RenderContext) {
        this.power = 0;

        this.type = 'Equipment';
    }
}