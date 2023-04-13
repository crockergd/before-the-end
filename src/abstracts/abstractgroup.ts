import { GameObjects } from 'phaser';
import RenderContext from '../contexts/rendercontext';
import TransitionType from '../ui/transitiontype';
import CallbackBinding from '../utils/callbackbinding';
import ObjectExtensions from '../utils/objectextensions';
import Vector from '../utils/vector';
import AbstractBaseType from './abstractbasetype';
import AbstractButton from './abstractbutton';
import AbstractDepth from './abstractdepth';
import AbstractMask from './abstractmask';
import AbstractScene from './abstractscene';
import AbstractSprite from './abstractsprite';
import AbstractText from './abstracttext';
import { AbstractType } from './abstracttype';

export default class AbstractGroup {
    private renderer: RenderContext;
    private visibility: boolean;
    public position: Vector;
    private _depth: number;
    private _affixed: boolean;
    private _alpha: number;
    private round: boolean;
    private parent: AbstractGroup;

    public mask: AbstractMask;
    public layer: GameObjects.Layer;
    public framework_object: Array<AbstractType>;

    get literals(): Array<GameObjects.GameObject> {
        let child_literals: Array<GameObjects.GameObject> = new Array<GameObjects.GameObject>();

        for (const child of this.children) {
            child_literals = child_literals.concat(child.literals);
        }

        return child_literals;
    }

    get visible(): boolean {
        return (this.parent?.visible ?? true) && this.visibility;
    }

    get x(): number {
        let x: number = this.position.x;
        if (this.parent) {
            x += this.parent.x;
        }
        return x;
    }

    set x(value: number) {
        this.position.x = value;
        this.update_position();
    }

    set y(value: number) {
        this.position.y = value;
        this.update_position();
    }

    get y(): number {
        let y: number = this.position.y;
        if (this.parent) {
            y += this.parent.y;
        }
        return y;
    }

    get group_x(): number {
        return this.position.x;
    }

    get group_y(): number {
        return this.position.y;
    }

    public get depth(): number {
        return this._depth;
    }

    public get affixed(): boolean {
        return this._affixed;
    }

    public set alpha(value: number) {
        this.set_alpha(value);
    }

    public get alpha(): number {
        let alpha: number = this._alpha;
        if (this.parent) {
            alpha *= this.parent.alpha;
        }
        return alpha;
    }

    public get length(): number {
        return this.framework_object.length;
    }

    public get children(): Array<AbstractType> {
        return this.framework_object;
    }

    public get framework_objects(): Array<Phaser.GameObjects.GameObject> {
        let obj: Array<any> = ObjectExtensions.array_flat(this.framework_object.map(child => (child instanceof AbstractGroup) ? child.framework_objects : (child as any).framework_object));
        obj = ObjectExtensions.array_flat(obj);
        return obj;
    }

    public get active(): boolean {
        if (this.children && this.length) return true;
        return false;
    }

    constructor(renderer: RenderContext, readonly scene: AbstractScene, collection?: AbstractGroup) {
        this.renderer = renderer;
        this.framework_object = new Array<AbstractType>();
        this.init();

        if (collection) collection.add(this);
    }

    public init(): void {
        this.visibility = true;
        this.position = new Vector(0, 0);
        this._depth = AbstractDepth.BASELINE;
        this._affixed = false;
        this._alpha = 1;
        this.round = false;
    }

    public offset_absolute(): void {
        if (!this.parent) return;
        this.set_position(-this.parent.group_x, -this.parent.group_y, true);
    }

    public set_position(x: number, y: number, relative: boolean = false): void {
        if (relative) {
            this.position.x += x;
            this.position.y += y;

        } else {
            this.position.x = x;
            this.position.y = y;
        }

        this.update_position();
    }

    public update_position(): void {
        for (const child of this.framework_object) {
            if (!(child instanceof AbstractGroup || child instanceof AbstractBaseType)) continue;

            child.update_position();
        }
    }

    public set_alpha(alpha: number): void {
        this._alpha = alpha;

        this.update_alpha();
    }

    public update_alpha(): void {
        for (const child of this.framework_object) {
            if (!(child instanceof AbstractGroup || child instanceof AbstractBaseType)) continue;

            child.update_alpha();
        }
    }

    public set_visible(visible: boolean): void {
        this.visibility = visible;

        this.update_visibility();
    }

    public update_visibility(): void {
        for (const child of this.framework_object) {
            if (!(child instanceof AbstractGroup || child instanceof AbstractBaseType)) continue;

            child.update_visibility();
        }
    }

    public bring_to_top(): void {
        for (const child of this.framework_objects) {
            child.displayList.bringToTop(child);
        }
    }

    public calculate_bounds(zeroed?: boolean): Vector {
        const bounds: Vector = new Vector(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0, 0);

        for (const child of this.children) {
            if (child instanceof AbstractButton) continue;

            const child_bounds: Vector = child.calculate_bounds();

            bounds.x = Math.min(child_bounds.x, bounds.x);
            bounds.y = Math.min(child_bounds.y, bounds.y);
            bounds.z = Math.max(child_bounds.z, bounds.z);
            bounds.w = Math.max(child_bounds.w, bounds.w);
        }

        if (zeroed) {
            bounds.z -= bounds.x;
            bounds.x -= bounds.x;
            bounds.w -= bounds.y;
            bounds.y -= bounds.y;
        }

        return bounds;
    }

    public transition(type: TransitionType): void {
        const duration: number = 100;

        switch (type) {
            case TransitionType.IN:
                this.set_visible(true);
                this.set_alpha(0);

                this.renderer.tween({
                    targets: this.literals,
                    duration: duration,
                    alpha: 1,
                    on_complete: new CallbackBinding(() => {

                    }, this)
                });

                break;

            case TransitionType.OUT:
                this.set_alpha(1);
                this.visibility = false;

                this.renderer.tween({
                    targets: this.literals,
                    duration: duration,
                    alpha: 0,
                    on_complete: new CallbackBinding(() => {
                        this.set_visible(false);
                    }, this)
                });

                break;
        }
    }

    public set_depth(depth: number, force?: boolean): void {
        this._depth = depth;
        for (const child of this.framework_object) {
            child.set_depth(depth, force);
        }
    }

    public set_layer_depth(depth: number): void {
        if (!this.layer) return;
        if (this.layer.depth === depth) return;
        this.layer.setDepth(depth);
    }

    public set_parent(parent: AbstractGroup): void {
        this.parent = parent;
    }

    public set_layer(): void {
        if (!this.layer) {
            this.layer = this.renderer.scene.add.layer(this.literals);
        }
    }

    public set_mask(mask: AbstractMask): void {
        this.mask = mask;

        for (const child of this.framework_object) {
            child.set_mask(this.mask);
        }
    }

    public affix_ui(): void {
        this._affixed = true;
        for (const child of this.framework_object) {
            child.affix_ui();
        }
    }

    public add(child: AbstractType): void {
        this.framework_object.push(child);

        if (child instanceof AbstractSprite || child instanceof AbstractText || child instanceof AbstractButton || child instanceof AbstractGroup) {
            child.set_parent(this);
        }

        if (child instanceof AbstractBaseType) {
            if (this.round) child.round_position();
        }

        this.update_visibility();
        this.update_position();
        this.update_alpha();
        child.set_depth(this.depth);
        if (this.mask) child.set_mask(this.mask);
        if (this.affixed) child.affix_ui();
        if (this.layer) {
            for (const literal of child.literals) {
                this.layer.add(literal);
            }
        }
    }

    public remove(index: number): AbstractType {
        return this.framework_object.splice(index, 1)[0];
    }

    public at(index: number): AbstractType {
        return this.framework_object[index];
    }

    public clean(): void {
        this.framework_object = this.framework_object.filter(child => child.active);
    }

    public clear(): void {
        if (this.framework_object) {
            for (const child of this.framework_object) {
                child.destroy();
            }
            this.framework_object = new Array<AbstractType>();
        }
    }

    public destroy(): void {
        this.clear();
        this.init();
    }

    public round_position(): void {
        this.round = true;

        for (const child of this.children) {
            if (child instanceof AbstractBaseType) {
                child.round_position();
            }
        }
    }
}