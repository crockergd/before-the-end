import AbstractDepth from '../abstracts/abstractdepth';
import AbstractGroup from '../abstracts/abstractgroup';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import RenderContext from '../contexts/rendercontext';
import Entity from '../entities/entity';
import CallbackBinding from '../utils/callbackbinding';
import WorldTimer from '../world/worldtimer';

export default class MainRenderer {
    public world_timer_group: AbstractGroup;
    public world_timer_bar: AbstractSprite;
    public world_timer_frame: AbstractSprite;

    constructor(readonly render_context: RenderContext, readonly timer: WorldTimer) {
        this.draw_world_timer();
    }

    public update(dt: number): void {
        const width: number = 356;
        const height: number = 6;
        this.world_timer_bar.crop(0, 0, width * this.timer.remaining_percentage, height);
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

    public draw_world_timer(): void {
        this.world_timer_group = this.render_context.add_group();
        this.world_timer_group.set_position(this.render_context.center_x, this.render_context.height - this.render_context.space_buffer);
        this.world_timer_group.affix_ui();
        this.world_timer_group.set_depth(AbstractDepth.UI);

        this.world_timer_frame = this.render_context.add_sprite(0, 0, 'world_timer_frame', this.world_timer_group);
        this.world_timer_frame.set_anchor(0.5, 1);

        this.world_timer_bar = this.render_context.add_sprite(0, - this.render_context.literal(2), 'world_timer_bar', this.world_timer_group);
        this.world_timer_bar.set_anchor(0.5, 1);
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