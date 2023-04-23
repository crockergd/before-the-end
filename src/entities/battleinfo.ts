import EntityState from './entitystate';

export default interface BattleInfo {
    alive: boolean;
    state: EntityState;
    power: number;
    repeat?: number;
    amount?: number;
}