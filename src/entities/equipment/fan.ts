import RenderContext from '../../contexts/rendercontext';
import Main from '../../scenes/main';
import MathExtensions from '../../utils/mathextensions';
import Vector from '../../utils/vector';
import Attack from './attack';
import Entity from '../entity';
import Equipment from './equipment';

export default class Fan extends Equipment {
    constructor(readonly scene: Main, readonly render_context: RenderContext) {
        super(scene, render_context);

        this.equipment_info = {
            type: 'Fan',
            key: 'fan',
            name: 'Fan',
            level: 0
        };

        this.type = 'Fan';
    }

    public attack(player: Entity, target: Vector): void {
        this.render_context.delay(100, () => {
            this.apply_scaling();
            this.apply_player_scaling(player);
            const attack_angle: number = 45;

            const cursor_direction: Vector = new Vector(target.x - player.x, target.y - player.y);

            const angle_l: number = MathExtensions.vector_to_degrees(cursor_direction) - attack_angle;
            const direction_l: Phaser.Math.Vector2 = cursor_direction.pv2.setAngle(Phaser.Math.DegToRad(angle_l));
            const fan_l: Attack = new Attack(this.attack_info);
            fan_l.sprite = this.scene_renderer.draw_fan(player, angle_l);
            this.scene_physics.ready_fan(player, fan_l);
            this.scene_physics.apply_force(fan_l.sprite, new Vector(direction_l.x, direction_l.y), this.attack_info.velocity);

            const angle_r: number = MathExtensions.vector_to_degrees(cursor_direction) + attack_angle;
            const direction_r: Phaser.Math.Vector2 = cursor_direction.pv2.setAngle(Phaser.Math.DegToRad(angle_r));
            const fan_r: Attack = new Attack(this.attack_info);
            fan_r.sprite = this.scene_renderer.draw_fan(player, angle_r + 70);
            this.scene_physics.ready_fan(player, fan_r);
            this.scene_physics.apply_force(fan_r.sprite, new Vector(direction_r.x, direction_r.y), this.attack_info.velocity);
        }, this);
    }

    public apply_scaling(): void {
        this.attack_info = {
            power: 0,
            latch: false,
            chain: 0,
            velocity: 0.2
        };

        this.attack_info.power = 3 * this.level;
    }
}