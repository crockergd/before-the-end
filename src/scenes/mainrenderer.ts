import AbstractDepth from '../abstracts/abstractdepth';
import AbstractGroup from '../abstracts/abstractgroup';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import RenderContext from '../contexts/rendercontext';
import Entity from '../entities/entity';
import CallbackBinding from '../utils/callbackbinding';
import MathExtensions from '../utils/mathextensions';
import WorldTimer from '../world/worldtimer';
import Main from './main';

export default class MainRenderer {
    public world_timer_group: AbstractGroup;
    public world_timer_bar: AbstractSprite;
    public world_timer_frame: AbstractSprite;
    public enemy_layer: AbstractGroup;

    constructor(readonly scene: Main, readonly render_context: RenderContext, readonly timer: WorldTimer) {
        this.draw_world_timer();
    }

    public update(dt: number): void {
        const width: number = 356;
        const height: number = 6;
        this.world_timer_bar.crop(0, 0, width * this.timer.remaining_percentage, height);
    }

    public draw_tiles(): void {
        // const transition: AbstractSprite = this.render_context.add_sprite(0, 0, 'zone_courtyards_transition');
        // transition.set_anchor(0.5, 0.5);

        const map_height: number = 1000;
        const map_width: number = 1000;
        const map_data: Array<Array<number>> = new Array<Array<number>>();

        for (let i: number = 0; i < map_height; i++) {
            const row_data: Array<number> = new Array<number>();

            for (let j: number = 0; j < map_width; j++) {
                row_data.push(MathExtensions.rand_weighted(false, 3, 1));
            }

            map_data.push(row_data);
        }

        const map: Phaser.Tilemaps.Tilemap = this.scene.make.tilemap({
            data: map_data,
            tileWidth: 32,
            tileHeight: 32
        });

        const tileset: Phaser.Tilemaps.Tileset = map.addTilesetImage('floor');
        const layer: Phaser.Tilemaps.TilemapLayer = map.createLayer(0, tileset, 0, 0);

        layer.setPosition(-layer.width / 2, -layer.height / 2);
        layer.setAlpha(0.6);
        layer.setScale(this.render_context.base_scale_factor, this.render_context.base_scale_factor);
        layer.setCullPadding(10, 10);

        // this.render_context.camera.setBackgroundColor(0x003003);
    }

    public draw_player(player: Entity): void {
        player.sprite = this.render_context.add_sprite(0, 0, player.sprite_key, undefined, undefined, true);
        player.sprite.set_anchor(0.5, 0.5);
        player.sprite.set_depth(AbstractDepth.FIELD);
        player.sprite.play('idle_' + player.sprite_key);

        this.render_context.camera.startFollow(player.sprite.framework_object, true, 0.5, 0.5);
    }

    public draw_enemy(x: number, y: number, enemy: Entity, player: Entity): void {
        if (!this.enemy_layer) {
            this.enemy_layer = this.render_context.add_group();
            this.enemy_layer.set_layer();
        }

        enemy.sprite = this.scene.retrieve_cache(enemy.sprite_key) ?? this.render_context.add_sprite(0, 0, enemy.sprite_key, this.enemy_layer, undefined, true);
        enemy.sprite.set_position(x, y);
        enemy.sprite.set_anchor(0.5, 0.5);
        enemy.sprite.play('idle_' + enemy.sprite_key);
        enemy.sprite.set_depth(Math.round(y), true);

        if (player.x < enemy.x) {
            enemy.sprite.flip_x();
        }

        // const glow: Phaser.FX.Glow = enemy.sprite.framework_object.postFX.addGlow(0x9f2273, 0);

        // this.render_context.tween({
        //     targets: [glow],
        //     outerStrength: 2,
        //     yoyo: true,
        //     repeat: -1
        // });
    }

    public draw_dagger(player: Entity, angle: number): AbstractSprite {
        const dagger: AbstractSprite = this.scene.retrieve_cache('stab') ?? this.render_context.add_sprite(0, 0, 'stab', undefined, undefined, true);
        dagger.set_position(player.x, player.y);
        dagger.set_depth(AbstractDepth.FIELD);
        dagger.set_rotation(angle);

        return dagger;
    }

    public draw_fan(player: Entity, angle: number): AbstractSprite {
        const fan: AbstractSprite = this.scene.retrieve_cache('stab') ?? this.render_context.add_sprite(0, 0, 'stab', undefined, undefined, true);
        fan.set_position(player.x, player.y);
        fan.set_anchor(0.5, 0.5);
        fan.set_depth(AbstractDepth.FIELD);
        fan.set_rotation(angle);

        return fan;
    }

    public draw_exp_drop(player: Entity, enemy: Entity): AbstractSprite {
        const exp_drop: AbstractSprite = this.scene.retrieve_cache('exp_drop') ?? this.render_context.add_sprite(0, 0, 'exp_drop', undefined, undefined, true);
        exp_drop.set_position(enemy.x, enemy.y);
        exp_drop.set_anchor(0.5, 0.5);

        return exp_drop;
    }

    public draw_world_timer(): void {
        this.world_timer_group = this.render_context.add_group();
        this.world_timer_group.set_position(this.render_context.center_x, this.render_context.height - (this.render_context.space_buffer * 2));
        this.world_timer_group.affix_ui();
        this.world_timer_group.set_depth(AbstractDepth.UI);

        this.world_timer_frame = this.render_context.add_sprite(0, 0, 'world_timer_frame', this.world_timer_group);
        this.world_timer_frame.set_anchor(0.5, 1);

        this.world_timer_bar = this.render_context.add_sprite(0, - this.render_context.literal(2), 'world_timer_bar', this.world_timer_group);
        this.world_timer_bar.set_anchor(0.5, 1);
    }

    public draw_game_over(player: Entity, on_complete: CallbackBinding): void {
        const game_over_text: AbstractText = this.render_context.add_text(this.render_context.center_x, this.render_context.center_y, 'Game Over');
        game_over_text.set_anchor(0.5, 0.5);
        game_over_text.affix_ui();
        game_over_text.set_scale(3, 3);
        game_over_text.set_depth(AbstractDepth.UI);
        game_over_text.set_alpha(0);

        const duration: number = 200;

        this.render_context.tween({
            targets: [game_over_text.framework_object],
            alpha: 1,
            duration: duration
        });

        this.render_context.tween({
            targets: [player.sprite.framework_object],
            alpha: 0,
            duration: duration,
            on_complete: new CallbackBinding(() => {
                player.battle_info.alive = false;
                player.destroy();
            }, this)
        });

        const vignette: Phaser.FX.Vignette = this.render_context.camera.postFX.addVignette(undefined, undefined, 1, 0);

        this.render_context.scene.tweens.add({
            targets: [vignette],
            radius: 0.5,
            strength: 0.5,
            duration: duration
        });

        this.render_context.delay(1000, () => {
            on_complete.call();
        }, this);
    }

    public flash_combat_text(x: number, y: number, value: string): void {
        const dmg_text: AbstractText = this.render_context.add_text(x, y, value);
        dmg_text.set_depth(AbstractDepth.UI);
        dmg_text.set_anchor(0.5, 1);
        dmg_text.set_scale(3, 3);

        this.render_context.tween({
            targets: [dmg_text.framework_object],
            duration: 400,
            alpha: 0,
            y: dmg_text.y - 20,
            on_complete: new CallbackBinding(() => {
                dmg_text.destroy();
            }, this)
        });
    }

    public flash_combat_hit(enemy: Entity): void {
        // const hit: AbstractSprite = this.render_context.add_sprite(enemy.x, enemy.y, 'hit_slash');
        // hit.set_anchor(0.5, 0.5);

        // hit.play('hit_slash', undefined, undefined, new CallbackBinding(() => {
        //     hit.destroy();
        // }, this));

        const glow: Phaser.FX.Glow = enemy.sprite.framework_object.postFX.addGlow(0x7f062e, 0, 0);

        this.render_context.tween({
            targets: [glow],
            duration: 160,
            innerStrength: 4,
            yoyo: true,
            on_complete: new CallbackBinding(() => {
                glow.destroy();
                enemy.sprite.framework_object.postFX.clear();
            }, this)
        });
    }

    public flash_enemy_death(enemy: Entity): void {
        this.render_context.tween({
            targets: [enemy.sprite.framework_object],
            alpha: 0,
            duration: 100,
            on_complete: new CallbackBinding(() => {
                this.scene.push_cache(enemy.sprite);
            }, this)
        });
    }

    public reactivate_sprite(sprite: AbstractSprite): void {
        sprite.set_alpha(1);
        sprite.set_visible(true);
    }

    public deactivate_sprite(sprite: AbstractSprite): void {
        sprite.set_visible(false);
        sprite.stop();
        sprite.framework_object.postFX.clear();
    }
}