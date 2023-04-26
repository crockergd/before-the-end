import Constants from '../utils/constants';
import MathExtensions from '../utils/mathextensions';
import EnemyWeight from './enemyweight';
import WorldState from './worldstate';

export default class WorldTimer {
    public doomed: boolean;
    public expiry_time: number;
    public elapsed_time: number;
    public difficulty_scalar: number;
    public enemy_weights: Array<EnemyWeight>;
    public state: WorldState;

    public get remaining(): number {
        return this.expiry_time;
    }

    public get remaining_percentage(): number {
        return this.remaining / this.doom_time;
    }

    constructor(readonly start_time: number, readonly doom_time: number) {
        this.doomed = false;
        this.expiry_time = this.doom_time;
        this.elapsed_time = 0;
        this.difficulty_scalar = 1;
        this.enemy_weights = new Array<EnemyWeight>();
        this.state = WorldState.STANDARD;

        for (const enemy of Constants.ENEMY_KEYS) {
            this.enemy_weights.push({
                key: enemy,
                weight: 0
            });
        }

        this.alter_weight('servant', 10);
    }

    public update(dt: number): boolean {
        const previous_time: number = this.elapsed_time;

        this.expiry_time -= (dt * this.difficulty_scalar);
        this.elapsed_time += dt;

        if (this.passed_milestone(7, this.elapsed_time, previous_time)) {
            this.alter_weight('huntsman', 3);

        } else if (this.passed_milestone(15, this.elapsed_time, previous_time)) {
            this.alter_weight('huntsman', 6);

        } else if (this.passed_milestone(22, this.elapsed_time, previous_time)) {
            this.alter_weight('huntsman', 10);

        } else if (this.passed_milestone(28, this.elapsed_time, previous_time)) {
            this.alter_weight('forester', 2);

        } else if (this.passed_milestone(34, this.elapsed_time, previous_time)) {
            this.alter_weight('forester', 5);

        } else if (this.passed_milestone(41, this.elapsed_time, previous_time)) {
            this.alter_weight('servant', 7);
            this.alter_weight('forester', 8);

        } else if (this.passed_milestone(48, this.elapsed_time, previous_time)) {
            this.alter_weight('servant', 5);
            this.alter_weight('huntsman', 8);
            this.alter_weight('forester', 10);

        } else if (this.passed_milestone(55, this.elapsed_time, previous_time)) {
            this.alter_weight('servant', 2);
            this.alter_weight('huntsman', 6);

        } else if (this.passed_milestone(61, this.elapsed_time, previous_time)) {
            this.alter_weight('mercenary', 1);

        } else if (this.passed_milestone(73, this.elapsed_time, previous_time)) {
            this.alter_weight('servant', 1);
            this.alter_weight('huntsman', 4);
            this.alter_weight('forester', 8);
            this.alter_weight('mercenary', 5);

        } else if (this.passed_milestone(90, this.elapsed_time, previous_time)) {
            this.alter_weight('servant', 0);
            this.alter_weight('huntsman', 0);
            this.alter_weight('forester', 0);
            this.alter_weight('mercenary', 0);
            this.alter_weight('baron', 1);

            this.state = WorldState.BOSS_SPAWNING;
        }

        return this.expiry_time > 0;
    }

    public extend_time(value: number): void {
        this.expiry_time += value;
        this.expiry_time = Math.min(this.expiry_time, this.doom_time);
    }

    public passed_milestone(milestone: number, current: number, previous: number): boolean {
        const passed: boolean = current > milestone && previous <= milestone;
        return passed;
    }

    public alter_weight(key: string, weight: number): void {
        const entry: EnemyWeight = this.enemy_weights.find(entry => entry.key === key);
        entry.weight = weight;
    }

    public generate_enemy(): string {
        return Constants.ENEMY_KEYS[MathExtensions.rand_weighted(false, ...this.enemy_weights.map(weight => weight.weight))];
    }
}