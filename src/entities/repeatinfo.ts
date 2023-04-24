import Entity from './entity';
import Attack from './equipment/attack';

export default interface RepeatTracker {
    count: number;
    targets: Array<Entity>;
    attacks: Array<Attack>;
}