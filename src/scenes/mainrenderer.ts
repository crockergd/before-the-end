import { Vector } from 'matter';
import RenderContext from '../contexts/rendercontext';
import Entity from '../entities/entity';
import StringExtensions from '../utils/stringextensions';
import AbstractText from '../abstracts/abstracttext';
import CallbackBinding from '../utils/callbackbinding';
import TextType from '../ui/texttype';

export default class MainRenderer {
    constructor(readonly render_context: RenderContext) {

    }

    public draw_player(player: Entity): void {
        player.sprite = this.render_context.add_sprite(0, 0, player.sprite_key, undefined, undefined, true);
        player.sprite.set_anchor(0.5, 0.5);
        player.sprite.play('idle_' + player.sprite_key);

        player.physics.setBody({
            type: 'rectangle',
            width: 100,
            height: 100
        });
        player.sprite.physics_body.setFixedRotation();
        player.sprite.physics_body.setFriction(0.4, 0.1);

        this.render_context.camera.startFollow(player.sprite.framework_object, true, 0.6, 0.6);
    }

    public draw_enemy(x: number, y: number, enemy: Entity): void {
        enemy.sprite = this.render_context.add_sprite(x, y, enemy.sprite_key, undefined, undefined, true);
        enemy.sprite.set_anchor(0.5, 0.5);
        enemy.sprite.play('idle_' + enemy.sprite_key);

        enemy.physics.setBody({
            type: 'rectangle',
            width: 100,
            height: 100
        });
        enemy.physics.setFixedRotation();
        enemy.physics.setStatic(true);
        enemy.physics.setBounce(0.8);
    }

    public flash_combat_text(x: number, y: number, value: string): void {
        const dmg_text: AbstractText = this.render_context.add_text(x, y, value);
        dmg_text.set_anchor(0.5, 1);
        dmg_text.set_scale(4, 4);

        this.render_context.tween({
            targets: [dmg_text.framework_object],
            alpha: 0,
            on_complete: new CallbackBinding(() => {
                dmg_text.destroy();
            }, this)
        });
    }

    public flash_enemy_death(enemy: Entity): void {
        this.render_context.tween({
            targets: [enemy.sprite.framework_object],
            alpha: 0,
            duration: 100,
            on_complete: new CallbackBinding(() => {
                enemy.destroy();
            }, this)
        });
    }
}