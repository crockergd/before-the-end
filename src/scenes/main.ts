import AbstractDepth from '../abstracts/abstractdepth';
import AbstractScene from '../abstracts/abstractscene';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import SceneData from '../contexts/scenedata';
import AttackType from '../entities/attacktype';
import Entity from '../entities/entity';
import EntityFactory from '../entities/entityfactory';
import EntityState from '../entities/entitystate';
import Dart from '../entities/equipment/dart';
import Attack from '../entities/equipment/attack';
import Cleave from '../entities/equipment/cleave';
import Dagger from '../entities/equipment/dagger';
import EquipmentInfo from '../entities/equipment/equipmentinfo';
import ExpDrop from '../entities/expdrop';
import RepeatTracker from '../entities/repeatinfo';
import TransitionType from '../ui/transitiontype';
import CallbackBinding from '../utils/callbackbinding';
import Constants from '../utils/constants';
import MathExtensions from '../utils/mathextensions';
import ObjectExtensions from '../utils/objectextensions';
import StringExtensions from '../utils/stringextensions';
import Vector from '../utils/vector';
import WorldTimer from '../world/worldtimer';
import MainPhysics from './mainphysics';
import MainRenderer from './mainrenderer';
import MainState from './mainstate';

export default class Main extends AbstractScene {
    public state: MainState;
    public scene_renderer: MainRenderer;
    public scene_physics: MainPhysics;

    public timer: WorldTimer;
    public player: Entity;
    public enemies: Array<Entity>;
    public exp_drops: Array<ExpDrop>;
    public debug: AbstractText;

    public enemies_defeated: number;
    public tick_count: number;
    public repeat_tracker: RepeatTracker;

    private sprite_cache: Array<AbstractSprite>;

    private lore_1: AbstractText;
    private lore_2: AbstractText;
    private lore_3: AbstractText;

    public get ready(): boolean {
        return !this.timer.doomed && this.state === MainState.ACTIVE;
    }

    public init(data: SceneData): void {
        super.init(data);
        this.render_context.set_scene(this);
        this.physics_context.set_scene(this);

        this.state = MainState.NONE;

        this.timer = new WorldTimer(this.render_context.now, 30);
        this.scene_renderer = new MainRenderer(this, this.render_context, this.timer);
        this.scene_physics = new MainPhysics(this, this.render_context, this.physics_context);

        this.matter.world.disableGravity();
        this.enemies_defeated = 0;
        this.tick_count = 0;
        this.enemies = new Array<Entity>();
        this.exp_drops = new Array<ExpDrop>();

        this.sprite_cache = new Array<AbstractSprite>();
        this.repeat_tracker = {
            count: 0,
            attacks: new Array<Attack>,
            targets: new Array<Entity>
        };
    }

    public create(): void {
        this.scene_renderer.draw_tiles();

        this.spawn_player();
        const spawn_distance: number = this.render_context.literal(140);
        this.spawn_enemy(1, new Vector(0, -spawn_distance * 1.5));
        this.spawn_enemy(1, new Vector(-spawn_distance * 1.5, -spawn_distance / 2));
        this.spawn_enemy(1, new Vector(spawn_distance * 1.5, -spawn_distance / 2));
        this.spawn_enemy(1, new Vector(-spawn_distance, spawn_distance));
        this.spawn_enemy(1, new Vector(spawn_distance, spawn_distance));

        this.debug = this.render_context.add_text(this.render_context.space_buffer, this.render_context.space_buffer, '');
        this.debug.set_depth(AbstractDepth.UI);
        this.debug.affix_ui();
        this.debug.set_visible(false);

        const world_tick_delay: number = 3000;
        this.render_context.delay(world_tick_delay, () => {
            this.render_context.bind_update('world_tick', new CallbackBinding(() => {
                if (!this.ready) return;

                this.world_tick();
            }, this), world_tick_delay);
        }, this);

        this.render_context.bind_update('enemy_face_player', new CallbackBinding(() => {
            if (!this.ready) return;

            for (const enemy of this.enemies.filter(enemy => enemy.alive)) {
                enemy.sprite.flip_x(this.player.x < enemy.x);
            }
        }, this), 1000);

        this.prep_intro_1();
    }

    public update(time: number, dt_ms: number): void {
        super.update(time, dt_ms);
        const dt: number = (dt_ms / 1000);

        if (!this.ready) return;

        this.debug.text = 'Position: ' + Math.floor(this.player.x) + ', ' + Math.floor(this.player.y) + Constants.LINE_BREAK +
            'Enemies Defeated: ' + this.enemies_defeated + Constants.LINE_BREAK +
            'Time Remaining: ' + Math.floor(this.timer.expiry_time) + Constants.LINE_BREAK +
            'Time Elapsed: ' + Math.ceil(this.timer.elapsed_time); // + Constants.LINE_BREAK +
        // 'Enemies: ' + this.enemies.length;

        let count: number = 0;
        for (const scene of this.game.scene.scenes) {
            count += scene.children.getChildren().length; //.filter(child => child.willRender(this.render_context.camera)).length;
        }

        this.debug.text = 'Display List: ' + count.toString();
        this.debug.text += Constants.LINE_BREAK + 'FPS: ' + StringExtensions.numeric(this.render_context.scene.game.loop.actualFps);
        this.debug.text += Constants.LINE_BREAK + 'Objects Created: ' + this.render_context.objects_created;

        for (const exp_drop of this.exp_drops.filter(exp_drop => exp_drop.collected)) {
            const player_direction: Vector = new Vector(exp_drop.sprite.absolute_x - this.player.x, exp_drop.sprite.absolute_y - this.player.y);
            const distance: number = Math.abs(player_direction.x + player_direction.y);

            if (distance < 3) {
                exp_drop.absorbed = true;
                this.exp_drops = this.exp_drops.filter(exp_drop => !exp_drop.absorbed);
                this.add_exp(10);

                this.push_cache(exp_drop.sprite);
                exp_drop.sprite = null;

            } else {
                player_direction.normalize();
                player_direction.multiply(400 * dt);
                exp_drop.sprite.set_position(exp_drop.sprite.absolute_x - player_direction.x, exp_drop.sprite.absolute_y - player_direction.y);
            }
        }

        if (!this.timer.update(dt)) {
            this.end_game();
        }
        this.scene_renderer.update(dt);
    }

    public spawn_player(): void {
        this.player = EntityFactory.create_player('bandit');
        this.scene_renderer.draw_player(this.player);
        this.scene_physics.ready_player(this.player);

        this.player.add_equipment(new Dagger(this, this.render_context));
        // this.player.add_equipment(new Fan(this, this.render_context));
        // this.player.add_equipment(new Cleave(this, this.render_context));
        // this.player.add_equipment(new Dart(this, this.render_context));
    }

    public spawn_enemy(count: number = 1, position?: Vector): void {
        for (let i: number = 0; i < count; i++) {
            const initial_position: Vector = new Vector(Math.floor(this.player.x), Math.floor(this.player.y));
            const inner_distance: number = this.render_context.literal(150);
            const outer_distance: number = this.render_context.literal(300);
            const enemy_position: Vector = position ?? MathExtensions.rand_within_donut_from_point(initial_position, inner_distance, outer_distance);

            const enemy: Entity = EntityFactory.create_enemy(EntityFactory.random_enemy_key(), 3 + this.enemies_defeated);
            this.scene_renderer.draw_enemy(enemy_position.x, enemy_position.y, enemy, this.player);
            this.scene_physics.ready_enemy(enemy);

            this.enemies.push(enemy);
        }

        this.enemies = this.enemies.filter(enemy => enemy.alive);
    }

    public spawn_exp(enemy: Entity): void {
        const exp_drop: ExpDrop = new ExpDrop();
        exp_drop.sprite = this.scene_renderer.draw_exp_drop(this.player, enemy);
        this.exp_drops.push(exp_drop);

        const initial_position: Vector = new Vector(Math.floor(enemy.x), Math.floor(enemy.y));
        const inner_distance: number = 90;
        const outer_distance: number = 150;
        const drop_location: Vector = MathExtensions.rand_within_donut_from_point(initial_position, inner_distance, outer_distance);

        this.render_context.tween({
            targets: [exp_drop.sprite.framework_object],
            duration: 200,
            x: drop_location.x,
            y: drop_location.y,
            on_complete: new CallbackBinding(() => {
                if (this.timer.doomed) return;

                this.render_context.tween({
                    targets: [exp_drop.sprite.framework_object],
                    duration: 200,
                    y: exp_drop.sprite.framework_object.y + this.render_context.literal(4),
                    yoyo: true,
                    repeat: -1
                });

                this.scene_physics.ready_exp_drop(this.player, exp_drop);
            }, this)
        });
    }

    public click(): void {
        if (!this.player.ready) return;

        const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;
        const cursor_direction: Vector = new Vector(pointer.worldX - this.player.x, pointer.worldY - this.player.y);
        if (cursor_direction.x > 0) {
            this.player.sprite.flip_x(false);
        } else {
            this.player.sprite.flip_x(true);
        }

        this.repeat_tracker = {
            count: 0,
            targets: new Array<Entity>,
            attacks: new Array<Attack>
        };
        this.enemies = this.enemies.filter(enemy => enemy.alive);
        for (const enemy of this.enemies) {
            enemy.reset_hits();
        }

        this.attack();

        this.player.set_state(EntityState.ATTACKING);
        this.render_context.delay(400, () => {
            this.player.set_state(EntityState.IDLE);
        }, this);
    }

    public attack(type: AttackType = AttackType.CURSOR, chained: boolean = false, last_enemy?: Entity): void {
        let target: Vector;

        switch (type) {
            case AttackType.CURSOR:
                const pointer: Phaser.Input.Pointer = this.render_context.scene.input.activePointer;
                target = new Vector(pointer.worldX, pointer.worldY);
                break;

            case AttackType.NEAREST:
                this.repeat_tracker.targets.push(last_enemy);

                const target_enemies: Array<Entity> = this.enemies.filter(enemy => !this.repeat_tracker.targets.filter(depth => depth.sprite.uid === enemy.sprite.uid).length).filter(enemy => enemy.alive);
                const nearest_enemy: Entity = this.nearest_entity_to(target_enemies, new Vector(this.player.x, this.player.y));
                if (!nearest_enemy) return;

                const nearest_distance: number = Phaser.Math.Distance.Between(nearest_enemy.x, nearest_enemy.y, this.player.x, this.player.y);
                if (nearest_distance > this.render_context.literal(350)) return;

                target = new Vector(nearest_enemy.x, nearest_enemy.y);
                break;
        }

        for (const equipment of this.player.equipment) {
            if (!chained || equipment.attack_info.repeat >= this.repeat_tracker.count) equipment.attack(this.player, target);
        }

        this.repeat_tracker.count++;
    }

    public collide(attack: Attack, enemy: Entity, collision: any): boolean {
        const power: number = attack.attack_info.power;

        if (attack.constraint) this.matter.world.removeConstraint(attack.constraint);

        this.scene_renderer.flash_combat_text(enemy.x, enemy.y - enemy.sprite.height_half + this.render_context.literal(20), StringExtensions.numeric(power));
        this.scene_renderer.flash_combat_hit(enemy);

        if (power >= enemy.power) {
            if (enemy.alive) {
                this.render_context.camera.shake(200, 0.003);

                this.enemies_defeated++;
                this.timer.extend_time(1);
                enemy.battle_info.alive = false;
                this.scene_renderer.flash_enemy_death(enemy);
                this.scene_physics.deactivate_body(enemy.sprite);
                this.spawn_exp(enemy);

                if (attack.attack_info.latch) {
                    this.render_context.delay(50, () => {
                        if (!this.ready) return;

                        this.player.physics_body.setVelocity(0);
                        this.player.sprite.set_position(enemy.x, enemy.y);
                    }, this);
                }

                this.collide_repeat(attack, enemy);

                return true;
            }

            return false;

        } else {
            enemy.battle_info.power -= power;

            enemy.register_hit(attack.attack_info.equipment_key);
            this.collide_repeat(attack, enemy);

            return false;
        }
    }

    public collide_repeat(attack: Attack, enemy: Entity): void {
        if (this.repeat_tracker.attacks.filter(repeat => repeat?.sprite?.uid === attack.sprite.uid).length) return;
        this.repeat_tracker.attacks.push(attack);

        if (attack.attack_info.repeat < this.repeat_tracker.count) return;

        this.render_context.delay(75, () => {
            if (!this.ready) return;

            // this.player.physics_body.setVelocity(0);
            this.attack(AttackType.NEAREST, true, enemy);
        }, this);
    }

    public add_exp(experience: number): void {
        this.player.add_exp(experience);
        while (this.player.level_info.experience >= this.player.level_info.chart[this.player.level_info.level]) {
            this.level_up();
        }
    }

    public level_up(): void {
        this.player.level_info.level++;
        this.player.battle_info.power += 2;
        this.scene_renderer.flash_combat_text(this.player.x, this.player.y, 'LEVEL UP');

        this.set_state(MainState.PAUSED);
        this.render_context.cache.loot_selection_cache.present(this.player, this.generate_loot(), new CallbackBinding(() => {
            this.set_state(MainState.ACTIVE);
        }, this));
    }

    public generate_loot(): Array<EquipmentInfo> {
        const max_loot: number = 3;

        let possibilities: Array<EquipmentInfo> = [{
            type: 'Dagger',
            key: 'dagger',
            name: 'Dagger',
            level: 0
        }, {
            type: 'Fan',
            key: 'fan',
            name: 'Fan',
            level: 0
        }, {
            type: 'Cleave',
            key: 'cleave',
            name: 'Cleave',
            level: 0
        },
        {
            type: 'Dart',
            key: 'dart',
            name: 'Dart',
            level: 0
        }];

        const slot_1_type: string = this.player.equipment.map(equipment => equipment.type)[MathExtensions.rand_int_inclusive(0, this.player.equipment.length - 1)];
        const slot_1: EquipmentInfo = possibilities.find(possibility => possibility.type === slot_1_type);

        possibilities = possibilities.filter(possibility => possibility.type !== slot_1.type);
        const slot_2: EquipmentInfo = possibilities[MathExtensions.rand_int_inclusive(0, possibilities.length - 1)];

        possibilities = possibilities.filter(possibility => possibility.type !== slot_2.type);
        const slot_3: EquipmentInfo = possibilities[MathExtensions.rand_int_inclusive(0, possibilities.length - 1)];

        return [slot_1, slot_2, slot_3];
    }

    public set_state(state: MainState): void {
        this.state = state;

        switch (state) {
            case MainState.ACTIVE:
                this.render_context.camera.postFX.clear();
                this.input.on(Constants.UP_EVENT, this.click, this);
                break;
            case MainState.PAUSED:
                this.input.off(Constants.UP_EVENT);
                this.render_context.camera.postFX.addBlur();
                this.render_context.camera.postFX.addGradient(0x000, 0x000, 0.6);
                break;
        }
    }

    public world_tick(): void {
        const enemies_summoned: number = 2 + (Math.floor(this.tick_count / 2));
        this.spawn_enemy(enemies_summoned);

        this.timer.difficulty_scalar += (this.tick_count / 64);

        this.tick_count++;
    }

    public nearest_entity_to(entities: Array<Entity>, target: Vector): Entity {
        entities.sort((lhs, rhs) => {
            const lhs_dist: number = Phaser.Math.Distance.Between(lhs.x, lhs.y, target.x, target.y);
            const rhs_dist: number = Phaser.Math.Distance.Between(rhs.x, rhs.y, target.x, target.y);
            return lhs_dist - rhs_dist;
        });

        return ObjectExtensions.array_access(entities, 0);
    }

    public retrieve_cache(sprite_key: string): AbstractSprite {
        let sprite: AbstractSprite = this.sprite_cache.find(cached => cached.key === sprite_key);
        if (sprite) {
            this.sprite_cache = this.sprite_cache.filter(cached => cached.uid !== sprite.uid);
            this.scene_renderer.reactivate_sprite(sprite);
            this.scene_physics.reactivate_body(sprite);
        }

        return sprite;
    }

    public push_cache(sprite: AbstractSprite): void {
        this.scene_physics.deactivate_body(sprite);
        this.scene_renderer.deactivate_sprite(sprite);
        this.sprite_cache.push(sprite);
    }

    public prep_intro_1(): void {
        this.player.sprite.set_alpha(0);
        for (const enemy of this.enemies) {
            enemy.sprite.framework_object.setAlpha(0);
        }
        this.scene_renderer.world_timer_group.set_alpha(0);
        this.scene_renderer.tile_layer.setAlpha(0);

        this.render_context.transition_scene(TransitionType.IN, new CallbackBinding(() => {
            this.lore_1 = this.render_context.add_text(this.render_context.center_x, this.render_context.center_y - this.render_context.literal(100), 'The final seal is crumbling');
            this.lore_1.set_anchor(0.5, 0);
            this.lore_1.affix_ui();
            this.lore_1.set_alpha(0);
            this.lore_1.set_depth(AbstractDepth.UI);

            const lore_1_duration: number = 400;
            this.render_context.tween({
                targets: [this.lore_1.framework_object],
                alpha: 1,
                duration: lore_1_duration / 2,
                on_complete: new CallbackBinding(() => {
                    this.render_context.tween({
                        targets: this.enemies.map(enemy => enemy.sprite.framework_object),
                        alphaTopLeft: 1,
                        alphaTopRight: 1,
                        alphaBottomLeft: 0,
                        alphaBottomRight: 0,
                        duration: lore_1_duration,
                        on_complete: new CallbackBinding(() => {
                            this.input.once(Constants.UP_EVENT, () => {
                                this.prep_intro_2();
                            }, this);
                        }, this)
                    });
                }, this)
            });
        }, this));
    }

    public prep_intro_2(): void {
        this.lore_2 = this.render_context.add_text(this.render_context.center_x, this.render_context.center_y - this.render_context.literal(0), 'This world won\'t last much longer');
        this.lore_2.set_anchor(0.5, 0);
        this.lore_2.affix_ui();
        this.lore_2.set_alpha(0);
        this.lore_2.set_depth(AbstractDepth.UI);

        const lore_2_duration: number = 400;
        this.render_context.tween({
            targets: [this.lore_2.framework_object],
            alpha: 1,
            duration: lore_2_duration / 2,
            on_complete: new CallbackBinding(() => {
                this.render_context.tween({
                    targets: [this.scene_renderer.world_timer_group],
                    alpha: 1,
                    duration: lore_2_duration,
                    on_complete: new CallbackBinding(() => {
                        this.input.once(Constants.UP_EVENT, () => {
                            this.prep_intro_3();
                        }, this);
                    }, this)
                });
            }, this)
        });
    }

    public prep_intro_3(): void {
        this.lore_3 = this.render_context.add_text(this.render_context.center_x, this.render_context.center_y + this.render_context.literal(100), 'You are our last hope');
        this.lore_3.set_anchor(0.5, 0);
        this.lore_3.affix_ui();
        this.lore_3.set_alpha(0);
        this.lore_3.set_depth(AbstractDepth.UI);

        const lore_3_duration: number = 400;
        this.render_context.tween({
            targets: [this.lore_3.framework_object],
            alpha: 1,
            duration: lore_3_duration / 2,
            on_complete: new CallbackBinding(() => {

                this.render_context.tween({
                    targets: [this.player.sprite.framework_object],
                    alpha: 1,
                    duration: lore_3_duration,
                    on_complete: new CallbackBinding(() => {
                        this.input.once(Constants.UP_EVENT, () => {
                            this.start_intro();
                        }, this);
                    }, this)
                });
            }, this)
        });
    }

    public start_intro(): void {
        this.render_context.tween({
            targets: [this.scene_renderer.tile_layer],
            alpha: 0.7,
            duration: 1000
        });

        this.render_context.tween({
            targets: [this.lore_1.framework_object, this.lore_2.framework_object, this.lore_3.framework_object],
            alpha: 0,
            duration: 2000,
            on_complete: new CallbackBinding(() => {
                this.lore_1.destroy();
                this.lore_2.destroy();
                this.lore_3.destroy();
                this.lore_1 = null;
                this.lore_2 = null;
                this.lore_3 = null;
                this.set_state(MainState.ACTIVE);
            }, this)
        });
    }

    public end_game(): void {
        this.input.off(Constants.UP_EVENT);
        this.render_context.cache.tweens.killAll();
        this.render_context.camera.stopFollow();
        this.render_context.unbind_update('world_tick');
        this.render_context.unbind_update('enemy_face_player');

        this.timer.doomed = true;
        this.scene_renderer.draw_game_over(this.player, this.enemies, this.timer, new CallbackBinding(() => {
            this.input.once(Constants.UP_EVENT, () => {
                this.render_context.transition_scene(TransitionType.OUT, new CallbackBinding(() => {
                    this.start('menu', {
                        scene_context: this.scene_context
                    });
                }, this));
            }, this);
        }, this));
    }
}