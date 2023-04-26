import StatType from './stattype';

export default interface EquipmentInfo {
    type: string;
    key: string;
    name: string;
    level: number;
    scaling?: Array<StatType>;
}