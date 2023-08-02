import { GameObjects, Textures } from 'phaser';
import AbstractButton from '../abstracts/abstractbutton';
import { AbstractCollectionType } from '../abstracts/abstractcollectiontype';
import AbstractDepth from '../abstracts/abstractdepth';
import AbstractGraphic from '../abstracts/abstractgraphic';
import AbstractGroup from '../abstracts/abstractgroup';
import AbstractLight from '../abstracts/abstractlight';
import AbstractMask from '../abstracts/abstractmask';
import AbstractScene from '../abstracts/abstractscene';
import AbstractSound from '../abstracts/abstractsound';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import Cache from '../scenes/cache';
import TextType from '../ui/texttype';
import TransitionType from '../ui/transitiontype';
import CallbackBinding from '../utils/callbackbinding';
import Constants from '../utils/constants';
import MathExtensions from '../utils/mathextensions';
import SFXChannel from '../utils/sfxchannel';
import SFXType from '../utils/sfxtype';
import TweenConfig from '../utils/tweenconfig';
import UpdateBinding from '../utils/updatebinding';
import Vector from '../utils/vector';
import SceneContext from './scenecontext';
import SettingJson from '../json_defs/settingjson';
import AbstractSpriteConfig from '../abstracts/abstractspriteconfig';
import { AbstractType } from '../abstracts/abstracttype';

export default class RenderContext {
    public scene: AbstractScene;
    public transitioning_scene: boolean;
    public transitioning_custom: boolean;
    public transitioning_component: boolean;
    public game_objects: Array<AbstractType>;
    public objects_created: number;

    public anim_scale: number;
    private update_bindings: Array<UpdateBinding>;
    private sounds: Array<AbstractSound>;

    public get transitioning(): boolean {
        return this.transitioning_scene || this.transitioning_custom || this.transitioning_component;
    }

    public get scene_context(): SceneContext {
        return this.scene.scene_context;
    }

    public get internal_scalar(): number {
        return 2;
    }

    public get space_buffer(): number {
        return this.literal(10) * this.internal_scalar;
    }

    public get space_buffer_sm(): number {
        return this.space_buffer / 2;
    }

    public get space_buffer_lg(): number {
        return this.space_buffer * 2;
    }

    public get frame_buffer(): number {
        return this.literal(10) * this.internal_scalar;
    }

    public get frame_buffer_lg(): number {
        return this.frame_buffer * 2;
    }

    public get combo_buffer(): number {
        return this.space_buffer + this.frame_buffer;
    }

    public get combo_buffer_sm(): number {
        return this.space_buffer_sm + this.frame_buffer;
    }

    public get DPR(): number {
        return window.devicePixelRatio;
    }

    public get baseline_x(): number {
        return 640 * this.internal_scalar;
    }

    public get baseline_y(): number {
        return 360 * this.internal_scalar;
    }

    public get round_scale_factor(): number {
        return Math.round(this.base_scale_factor);
    }

    public get base_scale_factor(): number {
        return 1; // Math.min((this.width / this.baseline_x), (this.height / this.baseline_y));
    }

    public get outer_scale_factor(): number {
        return Math.max(Math.max((this.width / this.baseline_x), (this.height / this.baseline_y)), 1);
    }

    public get inner_scale_factor(): number {
        return 1 + (this.outer_scale_factor - this.base_scale_factor);
    }

    public get screen_scale_factor(): number {
        return (this.width / this.baseline_x) * (this.height / this.baseline_y);
    }

    public get width(): number {
        return this.camera.displayWidth;
    }

    public get height(): number {
        return this.camera.displayHeight;
    }

    public get center_x(): number {
        return this.camera.centerX;
    }

    public get center_y(): number {
        return this.camera.centerY;
    }

    public get origin_x(): number {
        return (this.width - this.literal(this.baseline_x)) / 2;
    }

    public get origin_y(): number {
        return (this.height - this.literal(this.baseline_y)) / 2;
    }

    public get extent_x(): number {
        return this.origin_x + this.literal(this.baseline_x);
    }

    public get extent_y(): number {
        return this.origin_y + this.literal(this.baseline_y);
    }

    public get camera(): Phaser.Cameras.Scene2D.Camera {
        return this.scene.cameras.main;
    }

    public get gradient_scale(): number {
        return 1;
    }

    public get gradient_adjust(): number {
        return 0; //this.literal(4);
    }

    public get now(): number {
        return this.scene.time.now;
    }

    public get cache(): Cache {
        return (this.scene.scene.get('cache') as Cache);
    }

    public get settings(): SettingJson {
        return this.cache.settings;
    }

    public get focussed(): boolean {
        return document.hasFocus() && !document.hidden;
    }

    public get pointer_down(): boolean {
        return this.scene.input.activePointer?.isDown ?? false;
    }

    public get pointer_up(): boolean {
        return this.scene.input.activePointer?.isDown ?? false;
    }

    constructor() {
        this.game_objects = new Array<AbstractType>();
        this.transitioning_scene = false;
        this.transitioning_custom = false;
        this.transitioning_component = false;
        this.objects_created = 0;

        this.anim_scale = 1;
        this.update_bindings = new Array<UpdateBinding>();
        this.sounds = new Array<AbstractSound>();
    }

    public update(time: number, dt_ms: number): void {
        for (const binding of this.update_bindings) {
            if (time > (binding.last_time + binding.interval)) {
                if (this.focussed) binding.callback.call();
                binding.last_time = time;
            }
        }
    }

    public get_json(key: string): any {
        return this.scene.cache.json.get(key);
    }

    public literal(literal: number, round?: boolean): number {
        let value: number = literal;
        if (round) value *= this.round_scale_factor;
        else value *= this.base_scale_factor;
        return value;
    }

    public figurative(value: number): number {
        return value / this.base_scale_factor;
    }

    public spatial(value: number): number {
        return Math.ceil(value);
    }

    public add_group(collection?: AbstractGroup, scene_override?: AbstractScene): AbstractGroup {
        const scene: AbstractScene = scene_override ?? this.scene;

        const group_object: AbstractGroup = new AbstractGroup(this, scene, collection);

        return group_object;
    }

    public add_sprite(x: number, y: number, key: string, collection?: AbstractCollectionType, config?: AbstractSpriteConfig): AbstractSprite {
        const scene: AbstractScene = config?.scene_override ?? this.scene;

        const sprite_object: AbstractSprite = new AbstractSprite(this, scene, x, y, key, collection, config);
        sprite_object.set_base_scale(this.base_scale_factor, this.base_scale_factor);

        this.objects_created++;
        this.game_objects.push(sprite_object);

        return sprite_object;
    }

    public add_text(x: number, y: number, text: string, collection?: AbstractCollectionType, alt?: TextType, scene_override?: AbstractScene): AbstractText {
        const scene: AbstractScene = scene_override ?? this.scene;

        const text_object: AbstractText = new AbstractText(this, scene, x, y, text, collection, alt);
        text_object.set_scale(this.base_scale_factor, this.base_scale_factor);

        return text_object;
    }

    public make_dynamic_texture(width: number, height: number, key?: string): Textures.DynamicTexture {
        const render_texture_object: Textures.DynamicTexture = this.scene.textures.addDynamicTexture(key, width, height);

        return render_texture_object;
    }

    public add_bg(x: number, y: number, key: string): AbstractSprite {
        const sprite_object: AbstractSprite = new AbstractSprite(this, this.scene, x, y, key);
        sprite_object.set_scale(this.outer_scale_factor, this.outer_scale_factor);
        sprite_object.framework_object.setDepth(AbstractDepth.BG);

        return sprite_object;
    }

    public add_masked_sprite_geometry(x: number, y: number, sprite_key: string, mask_key: string, collection?: AbstractCollectionType): AbstractSprite {
        const sprite_object: AbstractSprite = new AbstractSprite(this, this.scene, x, y, sprite_key, collection);
        sprite_object.set_scale(this.base_scale_factor, this.base_scale_factor);

        const mask_dimensions: Vector = this.get_dimensions(mask_key);
        const mask_geom: GameObjects.Graphics = this.scene.make.graphics({}, false);
        mask_geom.fillRect(sprite_object.absolute_x + this.literal(1), sprite_object.absolute_y + this.literal(1), this.literal(mask_dimensions.width), this.literal(mask_dimensions.height));

        const mask_bmp: Phaser.Display.Masks.GeometryMask = mask_geom.createGeometryMask();
        sprite_object.framework_object.setMask(mask_bmp);

        return sprite_object;
    }

    public make_mask(x: number, y: number, key: string, origin: number = 0): AbstractMask {
        // const mask_image: Phaser.GameObjects.Image = this.scene.make.image({
        //     x: x,
        //     y: y,
        //     scale: this.base_scale_factor,
        //     origin: origin,
        //     key: key,
        //     add: false
        // });

        // const mask: Phaser.Display.Masks.BitmapMask = new Phaser.Display.Masks.BitmapMask(this.scene, mask_image);
        // return mask;

        const mask: AbstractMask = new AbstractMask(this, this.scene, x, y, key, origin);
        return mask;
    }

    public add_graphics(x: number, y: number, width: number, height: number, fill?: number, alpha?: number, collection?: AbstractCollectionType): AbstractGraphic {
        const graphics_object: AbstractGraphic = new AbstractGraphic(this, this.scene, x, y, width, height, fill, alpha, collection);

        return graphics_object;
    }

    public add_button(x: number, y: number, key: string, text?: string, collection?: AbstractCollectionType): AbstractButton {
        const button_object: AbstractButton = new AbstractButton(this, this.scene, x, y, key, text, collection);
        // button_object.text_object.pad();

        return button_object;
    }

    public add_light(x: number, y: number, radius: number, rgb?: number, intensity?: number): AbstractLight {
        const light_object: AbstractLight = new AbstractLight(this, this.scene, x, y, radius, rgb, intensity);

        return light_object;
    }

    public add_sound(key: string, channel: SFXChannel, volume: number = 1, loop: boolean = false): AbstractSound {
        const sound_object: AbstractSound = new AbstractSound(this, this.scene, key, channel, volume, loop);
        this.sounds.push(sound_object);

        return sound_object;
    }

    public add_alpha_fill(group?: AbstractGroup): AbstractSprite {
        const alpha_fill: AbstractSprite = this.add_sprite(0, 0, 'alpha_fill', group);
        alpha_fill.set_depth(AbstractDepth.ALPHA_FILL, true);
        alpha_fill.set_alpha(0.5);
        alpha_fill.set_anchor(0.5, 0.5);
        alpha_fill.affix_ui();
        // alpha_fill.framework_object.setInteractive();

        return alpha_fill;
    }

    public get_dimensions(key: string, frame_index: number = 0, scaled: boolean = false): Vector {
        const texture: Phaser.Textures.Texture = this.scene.textures.get(key);
        const frame: Phaser.Textures.Frame = texture.get(frame_index);
        let width: number = frame.width;
        if (scaled) width = this.literal(width);
        let height: number = frame.height;
        if (scaled) height = this.literal(height);

        return new Vector(width, height);
    }

    public sprite_exists(key: string): boolean {
        return this.scene.textures.exists(key);
    }

    public invalidate_texture(key: string): void {
        if (this.sprite_exists(key)) this.scene.textures.remove(key);
    }

    public resize_texts(texts: Array<AbstractText>, bounds_y: number) {
        let texts_sorted: Array<AbstractText> = texts.sort((lhs, rhs) => {
            if (lhs.absolute_y > rhs.absolute_y) {
                return 1;
            } else if (lhs.absolute_y < rhs.absolute_y) {
                return -1;
            } else {
                return 0;
            }
        });
        let previous_y: number = texts_sorted[0].absolute_y;
        const last_text: AbstractText = texts_sorted[texts.length - 1];
        let text_extent_y: number = last_text.absolute_y + last_text.height;

        while (text_extent_y > bounds_y) {
            let index: number = -1;
            for (const text of texts_sorted) {
                text.set_position(0, -(index), true);

                if (previous_y < text.absolute_y) {
                    previous_y = text.absolute_y;
                    index++;
                }
            }

            previous_y = texts_sorted[0].absolute_y;
            text_extent_y = last_text.absolute_y + last_text.height;
        }
    }

    public delay(time_ms: number, callback: any, context: any, ...args: Array<any>): Phaser.Time.TimerEvent {
        let scalar: number = 1;
        if (this.scene.scene.key === 'combat') {
            scalar /= this.anim_scale;
        }
        const time: number = time_ms * scalar;

        return this.cache.time.delayedCall(time, callback, args, context);
    }

    public undelay(event?: any): void {
        if (event) {
            this.cache.time.removeEvent(event);
        } else {
            this.cache.time.clearPendingEvents();
            this.cache.time.removeAllEvents();
        }
    }

    public tween(config: TweenConfig, base: any = {}): void {
        if (!config.targets || !config.targets.length) return;
        else base.targets = config.targets;

        Object.assign(base, config);

        if (config.blocking) {
            this.transitioning_component = true;
        }

        if (config.unique) {
            this.untween(base.targets);
        }

        if (config.duration) base.duration = config.duration;
        if (config.x || config.x === 0) base.x = config.x;
        if (config.y || config.y === 0) base.y = config.y;
        if (config.alpha || config.alpha === 0) base.alpha = config.alpha;
        if (config.scale || config.scale === 0) base.scale = config.scale;
        if (config.intensity || config.intensity === 0) base.intensity = config.intensity;
        if (config.yoyo) base.yoyo = config.yoyo;
        if (config.delay) base.delay = config.delay;
        if (config.repeat) base.repeat = config.repeat;
        if (config.repeatDelay) base.repeatDelay = config.repeatDelay;
        if (config.ease) base.ease = config.ease;
        base.onComplete = () => {
            config.on_complete?.call();
            this.transitioning_component = false;
        };

        base.onUpdate = (tween: Phaser.Tweens.Tween, sprite: Phaser.GameObjects.Sprite) => {
            if (config.on_update) {
                config.on_update.call(tween, sprite);
            }
        };

        this.cache.tweens.add(base);
    }

    public untween(object: any): void {
        this.cache.tweens.killTweensOf(object);
    }

    public particle(x: number, y: number, key: string, config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig): void {
        const particle: Phaser.GameObjects.Particles.ParticleEmitter = this.cache.add.particles(x, y, key, config);
        particle.setDepth(AbstractDepth.ACTIVE_WINDOW);

        let duration: number = 600;
        if (typeof config.lifespan === 'number') {
            duration = config.lifespan as number;
        }

        this.delay(duration, () => {
            particle.destroy();
        }, this);
    }

    public play(key: SFXType, channel: SFXChannel, volume: number = 1, loop: boolean = false): void {
        if (this.settings.mute) return;

        let sound: AbstractSound;
        switch (channel) {
            case SFXChannel.FX:
                sound = this.sounds.find(inner => inner.key === key && !inner.active);
                if (!sound) sound = this.add_sound(key, channel, volume, loop);
                sound.play();

                break;
            case SFXChannel.THEME:
                sound = this.sounds.find(inner => inner.key === key && inner.active);
                if (!sound) {
                    for (const theme of this.sounds.filter(inner => inner.key !== key && inner.channel === channel)) {
                        theme.stop();
                    }

                    sound = this.sounds.find(inner => inner.key === key && !inner.active);
                    if (!sound) sound = this.add_sound(key, channel, volume, loop);
                    sound.play();
                }

                break;
        }
    }

    public stop(channel: SFXChannel): void {
        const sounds: Array<AbstractSound> = this.sounds.filter(sound => sound.channel === channel && sound.active);
        for (const sound of sounds) {
            sound.stop();
        }
    }

    public bind_event(framework_object: Phaser.GameObjects.GameObject, key: string, callback: Function, context?: any, ...args: Array<any>): string {
        let event_key: string;
        if (key === Constants.TAP_EVENT) {
            framework_object.setInteractive();
            event_key = Constants.UP_EVENT;
        } else {
            event_key = key;
        }

        if (args && args.length) {
            framework_object.on(event_key, (pointer: Phaser.Input.Pointer) => {
                if (this.validate_controller(framework_object)) {

                } else {
                    if (key === Constants.TAP_EVENT && !this.validate_tolerance(pointer)) return;
                }

                // if (this.transitioning) return;

                framework_object.emit(event_key, ...args);
            });
            event_key += Constants.EVENT_RECAST;
            framework_object.on(event_key, callback, context);
        } else {
            framework_object.on(event_key, (...args) => {
                if (this.validate_controller(framework_object)) {

                } else {
                    if (key === Constants.TAP_EVENT && !this.validate_tolerance(args[0])) return;
                }

                framework_object.emit(event_key, ...args);
            });
            event_key += Constants.EVENT_RECAST;
            framework_object.on(event_key, callback, context);
        }

        return event_key;
    }

    public bind_update(key: string, callback: CallbackBinding, interval_ms: number): void {
        this.update_bindings.push({
            key: key,
            callback: callback,
            interval: interval_ms,
            last_time: 0
        });
    }

    public unbind_update(key?: string): void {
        if (key) {
            this.update_bindings = this.update_bindings.filter(binding => binding.key !== key);
        } else {
            this.update_bindings = new Array<UpdateBinding>();
        }
    }

    public validate_tolerance(pointer: Phaser.Input.Pointer): boolean {
        if (!pointer) return true;
        return false;

        const drift_tolerance: number = this.height / 16;
        if (MathExtensions.diff(pointer.downX, pointer.upX) > drift_tolerance) return false;
        if (MathExtensions.diff(pointer.downY, pointer.upY) > drift_tolerance) return false;

        const time_tolerance: number = 1000;
        if ((pointer.upTime - pointer.downTime) > time_tolerance) return false;

        return true;
    }

    public validate_controller(object: Phaser.GameObjects.GameObject): boolean {
        return true;

        // if (object instanceof Phaser.GameObjects.Sprite) {
        //     if (object.texture.key.includes('control_')) return true;
        // }

        // return false;
    }

    public set_scene(scene: AbstractScene): void {
        this.scene = scene;
    }

    public set_anim_scale(scale: number): void {
        this.anim_scale = scale;
    }

    public transition_scene(type: TransitionType, on_completion?: CallbackBinding): void {
        this.transitioning_scene = true;
        const time: number = 400;

        const camera: Phaser.Cameras.Scene2D.Camera = this.cache.scene.settings.active ? this.cache.cameras.main : this.scene.cameras.main;
        switch (type) {
            case TransitionType.IN:
                camera.fadeIn(time, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, completion: number) => {
                    if (completion < 1) return;

                    this.transitioning_scene = false;
                    if (on_completion) on_completion.call();
                }, this);

                break;

            case TransitionType.OUT:
                camera.fadeOut(time, 0, 0, 0, (camera: Phaser.Cameras.Scene2D.Camera, completion: number) => {
                    if (completion < 1) return;

                    this.transitioning_scene = false;
                    if (on_completion) on_completion.call();
                }, this);

                break;
        }
    }

    public transition_component(type: TransitionType, target: AbstractGroup | AbstractSprite, position: Vector, duration?: number, fade?: boolean, on_complete?: CallbackBinding): void {
        if (!target) {
            if (on_complete) on_complete.call();
            return;
        }

        if (!duration) duration = 300;
        const existing: Vector = new Vector(target.group_x, target.group_y);

        let tween_config: TweenConfig;

        switch (type) {
            case TransitionType.IN:
                if (position) target.set_position(position.x, position.y, true);
                if (fade) target.set_alpha(0);

                tween_config = {
                    targets: [target],
                    alpha: fade ? 1 : undefined,
                    duration: duration,
                    on_complete: new CallbackBinding(() => {
                        if (on_complete) on_complete.call();
                    }, this)
                };

                if (position) {
                    tween_config.x = existing.x;
                    tween_config.y = existing.y;
                }

                this.tween(tween_config);

                break;

            case TransitionType.OUT:
                if (fade) target.set_alpha(1);

                tween_config = {
                    targets: [target],
                    alpha: fade ? 0 : undefined,
                    duration: duration,
                    on_complete: new CallbackBinding(() => {
                        target.set_position(existing.x, existing.y);
                        target.set_visible(false);
                        if (fade) target.set_alpha(1);

                        if (on_complete) on_complete.call();
                    }, this)
                };

                if (position) {
                    tween_config.x = existing.x + position.x;
                    tween_config.y = existing.y + position.y;
                }

                this.tween(tween_config);

                break;

            case TransitionType.TO:
                this.tween({
                    targets: [target],
                    x: position.x,
                    y: position.y,
                    duration: duration,
                    on_complete: new CallbackBinding(() => {
                        if (on_complete) on_complete.call();
                    }, this)
                });

                break;
        }
    }

    public post_boot_ready(): void {
        // this.cache.ready();
    }
}