import AbstractScene from '../abstracts/abstractscene';
import AbstractSprite from '../abstracts/abstractsprite';
import SceneContext from '../contexts/scenecontext';
import TransitionType from '../ui/transitiontype';
import CallbackBinding from '../utils/callbackbinding';
import Constants from '../utils/constants';
import Cache from './cache';
import Main from './main';
import Menu from './menu';

export default class Boot extends AbstractScene {
    public preload(): void {
        this.scene_context = new SceneContext(this.game);
        this.render_context.set_scene(this);
        this.physics_context.set_scene(this);
        this.physics_context.init();

        this.game.scale.setGameSize(this.render_context.width * this.render_context.DPR, this.render_context.height * this.render_context.DPR);

        const require_image: __WebpackModuleApi.RequireContext = require.context('../../assets/images/', true);
        this.load.image('radbee_logo', require_image('./radbee_logo.png')).once('filecomplete-image-radbee_logo', () => {
            const offset_y: number = this.render_context.literal(10);

            const logo: AbstractSprite = this.render_context.add_sprite(this.render_context.center_x, this.render_context.center_y - offset_y, 'radbee_logo');
            logo.set_anchor(0.5, 0.5);
            logo.set_alpha(0);

            this.tweens.add({
                targets: [logo.framework_object],
                alpha: 1,
                duration: 200
            });

        }, this);

        this.load_scenes();
        this.load_assets();
    }

    public create(): void {
        this.load_animations();
        this.bind_device_events();

        this.scene.launch('cache', {
            scene_context: this.scene_context
        });

        this.render_context.transition_scene(TransitionType.OUT, new CallbackBinding(() => {
            this.start('menu', {
                scene_context: this.scene_context
            });
        }, this));
    }

    private load_scenes(): void {
        this.scene.add('menu', Menu, false);
        this.scene.add('main', Main, false);
        this.scene.add('cache', Cache, false);
    }

    private load_assets(): void {
        const require_image: __WebpackModuleApi.RequireContext = require.context('../../assets/images/', true);
        const require_tilesheet: __WebpackModuleApi.RequireContext = require.context('../../assets/tilesheets/', true);
        // const require_audio: __WebpackModuleApi.RequireContext = require.context('../../assets/audio/', true);
        // const require_json: __WebpackModuleApi.RequireContext = require.context('../../assets/json/', true);
        const require_bitmap: __WebpackModuleApi.RequireContext = require.context('../../assets/bitmap/', true);

        this.load.bitmapFont('pixchicago', require_bitmap('./pixchicago_0.png'), require_bitmap('./pixchicago.fnt'));
        this.load.bitmapFont('pixchicago_lg', require_bitmap('./pixchicago_lg_0.png'), require_bitmap('./pixchicago_lg.fnt'));
        this.load.bitmapFont('pixchicago_i', require_bitmap('./pixchicago_i_0.png'), require_bitmap('./pixchicago_i.fnt'));
        this.load.bitmapFont('pixchicago_green', require_bitmap('./pixchicago_green_0.png'), require_bitmap('./pixchicago_green.fnt'));
        this.load.bitmapFont('pixchicago_red', require_bitmap('./pixchicago_red_0.png'), require_bitmap('./pixchicago_red.fnt'));
        this.load.bitmapFont('pixchicago_lg_green', require_bitmap('./pixchicago_lg_green_0.png'), require_bitmap('./pixchicago_lg_green.fnt'));
        this.load.bitmapFont('pixchicago_lg_gold', require_bitmap('./pixchicago_lg_gold_0.png'), require_bitmap('./pixchicago_lg_gold.fnt'));

        this.load.spritesheet('bandit', require_tilesheet('./bandit.png'), { frameWidth: 84, frameHeight: 70 });
        this.load.spritesheet('servant', require_tilesheet('./servant.png'), { frameWidth: 68, frameHeight: 73 });
        this.load.spritesheet('baron', require_tilesheet('./baron.png'), { frameWidth: 62, frameHeight: 98 });
        this.load.spritesheet('huntsman', require_tilesheet('./huntsman.png'), { frameWidth: 126, frameHeight: 76 });
        this.load.spritesheet('forester', require_tilesheet('./forester.png'), { frameWidth: 130, frameHeight: 78 });
        this.load.spritesheet('hit_slash', require_tilesheet('./hit_slash.png'), { frameWidth: 49, frameHeight: 55 });
        this.load.spritesheet('ability_btn_sm', require_tilesheet('./ability_btn_sm.png'), { frameWidth: 171, frameHeight: 21 });
        this.load.spritesheet('equipment_slot', require_tilesheet('./equipment_slot.png'), { frameWidth: 30, frameHeight: 30 });
        this.load.spritesheet('equipment_icon', require_tilesheet('./equipment_icon.png'), { frameWidth: 30, frameHeight: 30 });
        this.load.spritesheet('loot_card_stamp', require_tilesheet('./loot_card_stamp.png'), { frameWidth: 45, frameHeight: 71 });

        this.load.image('zone_courtyards_transition', require_image('./zone_courtyards_transition.png'));
        this.load.image('world_timer_bar', require_image('./world_timer_bar.png'));
        this.load.image('world_timer_frame', require_image('./world_timer_frame.png'));
        this.load.image('stab', require_image('./stab.png'));
        this.load.image('exp_drop', require_image('./exp_drop.png'));
        this.load.image('floor', require_image('./floor.png'));
        this.load.image('loot_frame', require_image('./loot_frame.png'));
        this.load.image('loot_frame_banner', require_image('./loot_frame_banner.png'));
        this.load.image('loot_frame_portrait', require_image('./loot_frame_portrait.png'));
        this.load.image('loot_card_bg', require_image('./loot_card_bg.png'));
        this.load.image('loot_card_frame', require_image('./loot_card_frame.png'));
        this.load.image('loot_card_frame_mask', require_image('./loot_card_frame_mask.png'));
    }

    private load_animations(): void {
        const sprite_keys: Array<string> = Constants.CLASS_KEYS.concat(Constants.ENEMY_KEYS);

        for (const key of sprite_keys) {
            this.anims.create({
                key: 'idle_' + key,
                frames: this.anims.generateFrameNumbers(key, {
                    start: 0,
                    end: 2
                }),
                repeat: -1,
                frameRate: Constants.IDLE_ANIMATION_RATE,
                yoyo: true,
                skipMissedFrames: true
            });

            if (Constants.CLASS_KEYS.find(friendly => friendly === key)) {
                this.anims.create({
                    key: 'active_' + key,
                    frames: this.anims.generateFrameNumbers(key, {
                        start: 3,
                        end: 5
                    }),
                    repeat: -1,
                    frameRate: Constants.IDLE_ANIMATION_RATE,
                    yoyo: true,
                    skipMissedFrames: true
                });

                this.anims.create({
                    key: 'death_' + key,
                    frames: this.anims.generateFrameNumbers(key, {
                        start: 6,
                        end: 6
                    }),
                });
            }
        }

        this.anims.create({
            key: 'hit_slash',
            frames: this.anims.generateFrameNumbers('hit_slash', {
                start: 0,
                end: 7
            }),
            frameRate: 20
        });

        this.anims.create({
            key: 'loot_card_stamp_show',
            frames: this.anims.generateFrameNumbers('loot_card_stamp', {
                start: 0,
                end: 2
            }),
            frameRate: 16
        });

        this.anims.create({
            key: 'loot_card_stamp_flow',
            frames: this.anims.generateFrameNumbers('loot_card_stamp', {
                start: 2,
                end: 6
            }),
            frameRate: 6,
            repeat: -1
        });
    }

    private bind_device_events(): void {
        window.addEventListener('error', (event: ErrorEvent) => {
            // this.scene_context.log(LogLevel.ERROR, event.error.message, event.error.stack);
            event.preventDefault();
        });

        window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
            // this.scene_context.log(LogLevel.ERROR, event.reason, event.type);
            event.preventDefault();
        });

        document.addEventListener('pause', () => {
            this.render_context.scene.sound.pauseAll();
            this.render_context.scene.scene.pause();
            this.render_context.cache.scene.pause();
        });

        document.addEventListener('resume', () => {
            this.render_context.scene.sound.resumeAll();
            this.render_context.scene.scene.resume();
            this.render_context.cache.scene.resume();
        });
    }
}