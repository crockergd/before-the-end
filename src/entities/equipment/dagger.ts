import RenderContext from '../../contexts/rendercontext';
import MainRenderer from '../../scenes/mainrenderer';
import MathExtensions from '../../utils/mathextensions';
import Vector from '../../utils/vector';
import Entity from '../entity';
import Equipment from './equipment';

export default class Dagger extends Equipment {
    constructor(readonly player: Entity, readonly scene_renderer: MainRenderer, readonly render_context: RenderContext) {
        super();
    }

    public attack(): void {
        const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;
        const cursor_direction: Vector = new Vector(pointer.worldX - this.player.x, pointer.worldY - this.player.y);
        const angle: number = MathExtensions.vector_to_degrees(cursor_direction);

        this.scene_renderer.draw_attack(this.player, angle);

        const normalized_direction: Vector = cursor_direction.normalize();
        this.player.physics.applyForce(normalized_direction.pv2);
    }
}