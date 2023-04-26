import AbstractDepth from '../abstracts/abstractdepth';
import AbstractGroup from '../abstracts/abstractgroup';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import RenderContext from '../contexts/rendercontext';
import Entity from '../entities/entity';
import CallbackBinding from '../utils/callbackbinding';
import MathExtensions from '../utils/mathextensions';
import Vector from '../utils/vector';
import WorldTimer from '../world/worldtimer';
import Main from './main';

export default class MainRenderer {
    public world_timer_group: AbstractGroup;
    public world_timer_bar: AbstractSprite;
    public world_timer_frame: AbstractSprite;
    public world_timer_glow: Phaser.FX.Glow;
    public enemy_layer: AbstractGroup;
    public tile_layer: Phaser.Tilemaps.TilemapLayer;

    public last_timer_percentage: number;

    constructor(readonly scene: Main, readonly render_context: RenderContext, readonly timer: WorldTimer) {
        this.draw_world_timer();
    }

    public update(dt: number): void {
        const remaining_percentage: number = this.timer.remaining_percentage;

        const width: number = 356;
        const height: number = 6;
        this.world_timer_bar.crop(0, 0, width * remaining_percentage, height);
        this.world_timer_bar.set_position(this.render_context.literal((width * (1 - remaining_percentage)) / 2), 0);

        this.world_timer_glow.outerStrength = 4 * (1 - remaining_percentage);
        this.world_timer_glow.innerStrength = 2 * (1 - remaining_percentage);

        const danger_percentage: number = 0.2;
        if (remaining_percentage < danger_percentage && this.last_timer_percentage >= danger_percentage) {
            this.render_context.tween({
                targets: [this.world_timer_bar.framework_object],
                alpha: 0.3,
                duration: 200,
                yoyo: true,
                repeat: -1
            });

        } else if (remaining_percentage > danger_percentage && this.last_timer_percentage <= danger_percentage) {
            this.render_context.untween(this.world_timer_bar.framework_object);
            this.world_timer_bar.set_alpha(1);
        }

        this.last_timer_percentage = remaining_percentage;

        const color_percentage: number = 255 * Math.max(0.7 - remaining_percentage, 0);
        const color: any = new Phaser.Display.Color(color_percentage, color_percentage, color_percentage);
        this.render_context.camera.setBackgroundColor(color);
    }

    public draw_tiles(): void {
        // const transition: AbstractSprite = this.render_context.add_sprite(0, 0, 'zone_courtyards_transition');
        // transition.set_anchor(0.5, 0.5);

        const map_height: number = 600;
        const map_width: number = 600;
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
        this.tile_layer = map.createLayer(0, tileset, 0, 0);

        this.tile_layer.setPosition(-this.tile_layer.width / 2, -this.tile_layer.height / 2);
        this.tile_layer.setAlpha(0.7);
        this.tile_layer.setScale(this.render_context.base_scale_factor, this.render_context.base_scale_factor);
        this.tile_layer.setCullPadding(10, 10);

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
        enemy.sprite.set_alpha(new Vector(1, 1, 0, 0));

        if (player.x < enemy.x) {
            enemy.sprite.flip_x();
        }

        if (enemy.sprite_key === 'baron') {
            // const glow: Phaser.FX.Glow = enemy.sprite.framework_object.postFX.addGlow(0x9f2273, 0);
            const glow: Phaser.FX.Glow = enemy.sprite.framework_object.postFX.addGlow(0x18172f, 0);
            this.render_context.tween({
                targets: [glow],
                outerStrength: 8,
                yoyo: true,
                on_complete: new CallbackBinding(() => {
                    glow.destroy();
                    enemy.sprite.framework_object.postFX.clear();
                }, this)
            });
        }
    }

    public draw_dagger(player: Entity, angle: number): AbstractSprite {
        const dagger: AbstractSprite = this.scene.retrieve_cache('stab') ?? this.render_context.add_sprite(0, 0, 'stab', undefined, undefined, true);
        dagger.set_position(player.x, player.y);
        dagger.set_anchor(0, 0);
        dagger.set_depth(AbstractDepth.FIELD);
        dagger.set_rotation(angle);

        // this.render_context.particle(player.x, player.y, 'stab', {
        //     speed: 100,
        //     lifespan: 400,
        //     scaleX: this.render_context.base_scale_factor - (this.render_context.base_scale_factor * 2),
        //     scaleY: this.render_context.base_scale_factor,
        //     accelerationY: -200,
        //     accelerationX: -200,
        //     alpha: {
        //         start: 0.6,
        //         end: 0
        //     },
        //     maxParticles: 20
        // });

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

    public draw_cleave(x: number, y: number, angle: number): AbstractSprite {
        const cleave: AbstractSprite = this.scene.retrieve_cache('swing_wide') ?? this.render_context.add_sprite(0, 0, 'swing_wide', undefined, undefined, true);
        cleave.set_position(x, y);
        cleave.set_anchor(0.5, 0.5);
        cleave.set_depth(AbstractDepth.FIELD);
        cleave.set_rotation(angle);

        return cleave;
    }

    public draw_dart(player: Entity, angle: number): AbstractSprite {
        const dart: AbstractSprite = this.scene.retrieve_cache('dart') ?? this.render_context.add_sprite(0, 0, 'dart', undefined, undefined, true);
        dart.set_position(player.x, player.y);
        dart.set_anchor(0.5, 0.5);
        dart.set_depth(AbstractDepth.FIELD);
        dart.set_rotation(angle);

        return dart;
    }

    public draw_exp_drop(player: Entity, enemy: Entity): AbstractSprite {
        const exp_drop: AbstractSprite = this.scene.retrieve_cache('exp_drop') ?? this.render_context.add_sprite(0, 0, 'exp_drop', undefined, undefined, true);
        exp_drop.set_position(enemy.x, enemy.y);
        exp_drop.set_anchor(0.5, 0.5);

        return exp_drop;
    }

    public draw_world_timer(): void {
        this.world_timer_group = this.render_context.add_group();
        this.world_timer_group.set_position(this.render_context.center_x, this.render_context.space_buffer);
        this.world_timer_group.affix_ui();
        this.world_timer_group.set_depth(AbstractDepth.UI);

        // this.world_timer_frame = this.render_context.add_sprite(0, 0, 'world_timer_frame', this.world_timer_group);
        // this.world_timer_frame.set_anchor(0.5, 0);

        this.world_timer_bar = this.render_context.add_sprite(0, 0, 'world_timer_bar', this.world_timer_group);
        this.world_timer_bar.set_anchor(0.5, 0);

        this.world_timer_glow = this.world_timer_bar.framework_object.postFX.addGlow(0xffffff, 0, 0);
    }

    public draw_game_over(player: Entity, enemies: Array<Entity>, world_timer: WorldTimer, on_complete: CallbackBinding): void {
        const game_over_text: AbstractText = this.render_context.add_text(this.render_context.center_x, this.render_context.center_y, 'Time survived: ' + world_timer.elapsed_time.toFixed(1) + 's');
        game_over_text.set_anchor(0.5, 0.5);
        game_over_text.affix_ui();
        game_over_text.set_scale(2, 2);
        game_over_text.set_depth(AbstractDepth.UI);
        game_over_text.set_alpha(0);

        const duration: number = 200;

        this.render_context.tween({
            targets: [game_over_text.framework_object],
            alpha: 1,
            duration: duration
        });

        this.render_context.tween({
            targets: [this.tile_layer],
            alpha: 0,
            duration: duration * 3
        });

        this.render_context.tween({
            targets: [player.sprite.framework_object],
            alphaTopLeft: 0,
            alphaTopRight: 0,
            alphaBottomLeft: 0,
            alphaBottomRight: 0,
            duration: duration,
            on_complete: new CallbackBinding(() => {
                player.battle_info.alive = false;
                player.destroy();
            }, this)
        });

        for (const enemy of enemies) {
            enemy.sprite.stop();
        }

        // const vignette: Phaser.FX.Vignette = this.render_context.camera.postFX.addVignette(undefined, undefined, 1, 0);

        // this.render_context.scene.tweens.add({
        //     targets: [vignette],
        //     radius: 0.5,
        //     strength: 0.5,
        //     duration: duration
        // });

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
            alphaTopLeft: 0,
            alphaTopRight: 0,
            alphaBottomLeft: 0,
            alphaBottomRight: 0,
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