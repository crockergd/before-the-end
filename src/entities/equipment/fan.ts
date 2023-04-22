import AbstractSprite from '../../abstracts/abstractsprite';
import MathExtensions from '../../utils/mathextensions';
import Vector from '../../utils/vector';
import Attack from '../attacks/attack';
import Entity from '../entity';
import Equipment from './equipment';

export default class Fan extends Equipment {
    public attack(player: Entity): void {
        const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;
        const cursor_direction_l: Vector = new Vector((pointer.worldX - 100) - player.x, pointer.worldY - player.y);
        const angle_l: number = MathExtensions.vector_to_degrees(cursor_direction_l);

        const cursor_direction_r: Vector = new Vector((pointer.worldX + 100) - player.x, pointer.worldY - player.y);
        const angle_r: number = MathExtensions.vector_to_degrees(cursor_direction_l);

        const fan_l: Attack = new Attack(this.power);
        fan_l.sprite = this.scene_renderer.draw_fan(player, angle_l);
        const fan_r: Attack = new Attack(this.power);
        fan_r.sprite = this.scene_renderer.draw_fan(player, angle_r);

        this.scene_physics.ready_fan(fan_l);
        this.scene_physics.ready_fan(fan_r);
        this.scene_physics.apply_force(fan_l.sprite, cursor_direction_l, 0.4);
        this.scene_physics.apply_force(fan_r.sprite, cursor_direction_r, 0.4);
    }
}