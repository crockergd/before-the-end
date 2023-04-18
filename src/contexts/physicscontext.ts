import AbstractScene from '../abstracts/abstractscene';

export default class PhysicsContext {
    public scene: AbstractScene;

    public collision_none: number;
    public collision_player: number;
    public collision_enemy: number;
    public collision_attack: number;
    public collision_drop: number;

    public get matter(): Phaser.Physics.Matter.MatterPhysics {
        return this.scene.matter;
    }

    constructor() {

    }

    public init(): void {
        this.collision_none = this.matter.world.nextCategory();
        this.collision_player = this.matter.world.nextCategory();
        this.collision_enemy = this.matter.world.nextCategory();
        this.collision_attack = this.matter.world.nextCategory();
        this.collision_drop = this.matter.world.nextCategory();
    }

    public set_scene(scene: AbstractScene): void {
        this.scene = scene;
    }
}