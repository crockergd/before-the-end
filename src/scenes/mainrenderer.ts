import { Vector } from 'matter';
import RenderContext from '../contexts/rendercontext';
import Entity from '../entities/entity';

export default class MainRenderer {
    constructor(readonly render_context: RenderContext) {

    }

    public draw_player(player: Entity): void {
        player.sprite = this.render_context.add_sprite(0, 0, player.sprite_key, undefined, undefined, true);
        player.sprite.set_anchor(0.5, 0.5);
        player.sprite.play('idle_' + player.sprite_key);

        player.sprite.physics_body.setFixedRotation();
        player.sprite.physics_body.setFriction(0.4, 0.1);

        this.render_context.camera.startFollow(player.sprite.framework_object, true, 0.6, 0.6);
    }

    public draw_enemy(enemy: Entity, position: Vector): void {
        enemy.sprite = this.render_context.add_sprite(position.x, position.y, enemy.sprite_key, undefined, undefined, true);
        enemy.sprite.set_anchor(0.5, 0.5);
        enemy.sprite.play('idle_' + enemy.sprite_key);
        enemy.sprite.physics_body.setFixedRotation();
        enemy.sprite.physics_body.setStatic(true);
        enemy.sprite.physics_body.setBounce(0.8);
    }
}