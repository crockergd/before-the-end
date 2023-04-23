import RenderContext from '../../contexts/rendercontext';
import Main from '../../scenes/main';
import MathExtensions from '../../utils/mathextensions';
import Vector from '../../utils/vector';
import Attack from '../attacks/attack';
import Entity from '../entity';
import Equipment from './equipment';

export default class Dagger extends Equipment {
    constructor(readonly scene: Main, readonly render_context: RenderContext) {
        super(scene, render_context);

        this.info = {
            type: 'Dagger',
            key: 'dagger',
            name: 'Dagger',
            level: 0
        };

        this.type = 'Dagger';
    }

    public attack(player: Entity): void {
        this.apply_scaling();

        const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;
        const cursor_direction: Vector = new Vector(pointer.worldX - player.x, pointer.worldY - player.y);
        const angle: number = MathExtensions.vector_to_degrees(cursor_direction);

        const dagger: Attack = new Attack(this.power);
        dagger.latch = true;
        dagger.sprite = this.scene_renderer.draw_dagger(player, angle);
        this.scene_physics.ready_dagger(player, dagger);
        this.scene_physics.apply_force(player.sprite, cursor_direction);
    }

    public apply_scaling(): void {
        this.power = 3 * this.level;
    }
}