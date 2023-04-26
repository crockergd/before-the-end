import StatType from '../entities/equipment/stattype';

export default abstract class StringExtensions {
    public static percentage(value: number): string {
        return StringExtensions.numeric(value * 100) + '%';
    }

    public static numeric(value: number, precision?: number): string {
        if (!precision) return Math.ceil(value).toString();

        const readable: string = value.toPrecision(precision);
        return readable;
    }

    public static timestamp(timestamp: number): string {
        return new Date(timestamp).toLocaleString();
    }

    public static stat_type(stat_type: StatType): string {
        switch (stat_type) {
            case StatType.POWER:
                return 'Power';
            case StatType.VELOCITY:
                return 'Velocity';
            case StatType.AMOUNT:
                return 'Amount';
            case StatType.REPEAT:
                return 'Repeat';
        }
    }
}