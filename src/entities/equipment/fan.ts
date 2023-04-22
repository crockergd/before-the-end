import AbstractSprite from '../../abstracts/abstractsprite';
import RenderContext from '../../contexts/rendercontext';
import MainRenderer from '../../scenes/mainrenderer';
import MathExtensions from '../../utils/mathextensions';
import Vector from '../../utils/vector';
import Entity from '../entity';
import Equipment from './equipment';

export default class Fan extends Equipment {
    constructor(readonly player: Entity, readonly scene_renderer: MainRenderer, readonly render_context: RenderContext) {
        super();
    }

    public attack(): void {
        const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;
        const cursor_direction_l: Vector = new Vector((pointer.worldX - 100) - this.player.x, pointer.worldY - this.player.y);
        const angle_l: number = MathExtensions.vector_to_degrees(cursor_direction_l);

        const cursor_direction_r: Vector = new Vector((pointer.worldX + 100) - this.player.x, pointer.worldY - this.player.y);
        const angle_r: number = MathExtensions.vector_to_degrees(cursor_direction_l);

        const fan_l: AbstractSprite = this.scene_renderer.draw_fan(this.player, angle_l);
        const fan_r: AbstractSprite = this.scene_renderer.draw_fan(this.player, angle_r);

        const normalized_direction_l: Vector = cursor_direction_l.normalize().multiply(0.4);
        fan_l.physics_body.applyForce(normalized_direction_l.pv2);

        const normalized_direction_r: Vector = cursor_direction_r.normalize().multiply(0.4);
        fan_r.physics_body.applyForce(normalized_direction_r.pv2);
    }
}