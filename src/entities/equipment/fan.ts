import RenderContext from '../../contexts/rendercontext';
import Main from '../../scenes/main';
import MathExtensions from '../../utils/mathextensions';
import Vector from '../../utils/vector';
import Attack from '../attacks/attack';
import Entity from '../entity';
import Equipment from './equipment';

export default class Fan extends Equipment {
    constructor(readonly scene: Main, readonly render_context: RenderContext) {
        super(scene, render_context);

        this.info = {
            type: 'Fan',
            key: 'fan',
            name: 'Fan',
            level: 0
        };

        this.type = 'Fan';
    }

    public attack(player: Entity): void {
        this.render_context.delay(100, () => {
            this.apply_scaling();
            const velocity_scalar: number = 0.2;
            const attack_angle: number = 45;

            const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;
            const cursor_direction: Vector = new Vector(pointer.worldX - player.x, pointer.worldY - player.y);

            const angle_l: number = MathExtensions.vector_to_degrees(cursor_direction) - attack_angle;
            const direction_l: Phaser.Math.Vector2 = cursor_direction.pv2.setAngle(Phaser.Math.DegToRad(angle_l));
            const fan_l: Attack = new Attack(this.power);
            fan_l.sprite = this.scene_renderer.draw_fan(player, angle_l);
            this.scene_physics.ready_fan(player, fan_l);
            this.scene_physics.apply_force(fan_l.sprite, new Vector(direction_l.x, direction_l.y), velocity_scalar);

            const angle_r: number = MathExtensions.vector_to_degrees(cursor_direction) + attack_angle;
            const direction_r: Phaser.Math.Vector2 = cursor_direction.pv2.setAngle(Phaser.Math.DegToRad(angle_r));
            const fan_r: Attack = new Attack(this.power);
            fan_r.sprite = this.scene_renderer.draw_fan(player, angle_r + 70);
            this.scene_physics.ready_fan(player, fan_r);
            this.scene_physics.apply_force(fan_r.sprite, new Vector(direction_r.x, direction_r.y), velocity_scalar);
        }, this);
    }

    public apply_scaling(): void {
        this.power = 3 * this.level;
    }
}