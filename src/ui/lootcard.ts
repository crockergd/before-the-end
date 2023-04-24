import AbstractGroup from '../abstracts/abstractgroup';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import RenderContext from '../contexts/rendercontext';
import Entity from '../entities/entity';
import { Dagger, Fan } from '../entities/equipment';
import EquipmentInfo from '../entities/equipment/equipmentinfo';
import Constants from '../utils/constants';
import TextType from './texttype';

export default class LootCard {
    public group: AbstractGroup;
    public bg: AbstractSprite;
    public frame: AbstractSprite;
    public slot: AbstractSprite;
    public icon: AbstractSprite;
    public title: AbstractText;
    public details: AbstractText;
    public upgrade: AbstractText;
    public stamp: AbstractSprite;

    public equipment_key: string;

    constructor(readonly render_context: RenderContext, parent?: AbstractGroup) {
        this.group = this.render_context.add_group(parent);

        this.bg = this.render_context.add_sprite(0, 0, 'loot_card_bg', this.group);
        this.bg.set_scale(2, 2);
        this.bg.set_position(this.bg.width_half, this.bg.height_half, true);
        this.bg.set_anchor(0.5, 0.5);

        this.frame = this.render_context.add_sprite(0, 0, 'loot_card_frame', this.group);
        this.frame.set_scale(2, 2);
        this.frame.set_position(this.bg.width_half, this.bg.height_half, true);
        this.frame.set_anchor(0.5, 0.5);

        this.slot = this.render_context.add_sprite((this.frame.group_x - this.frame.width_half) + this.render_context.space_buffer, (this.frame.group_y - this.frame.height_half) + this.render_context.space_buffer, 'equipment_slot', this.group);
        this.slot.set_scale(2, 2);

        this.icon = this.render_context.add_sprite(this.slot.group_x, this.slot.group_y, 'equipment_icon', this.group);
        this.icon.set_scale(2, 2);

        this.title = this.render_context.add_text(this.slot.group_x + this.slot.width + this.render_context.space_buffer, (this.frame.group_y - this.frame.height_half) + this.render_context.space_buffer - this.render_context.literal(4), '', this.group, TextType.LG);
        // this.title.set_word_wrap(60);

        this.details = this.render_context.add_text(this.slot.group_x, this.slot.group_y + this.slot.height + this.render_context.space_buffer, '', this.group);
        this.details.set_word_wrap(200);

        this.upgrade = this.render_context.add_text(this.slot.group_x, 0, '', this.group);
        this.upgrade.set_word_wrap(200);

        this.stamp = this.render_context.add_sprite((this.frame.group_x - this.frame.width_half) + this.frame.width - this.render_context.literal(12), this.render_context.literal(52), 'loot_card_stamp', this.group);
        this.stamp.set_scale(2, 2);
        this.stamp.set_anchor(0.5, 0.5);
        this.stamp.set_frame(3);
    }

    public sync(player: Entity, equipment_info: EquipmentInfo): void {
        this.equipment_key = equipment_info.type;

        this.title.text = equipment_info.name;
        this.icon.set_frame(4);

        const equipment_level: number = player.get_equipment_level(equipment_info.type);

        let details: string = '';
        let upgrade: string = 'Level ' + (equipment_level + 1) + Constants.LINE_BREAK;
        switch (equipment_info.type) {
            case Dagger.name:
                details = Dagger.description(0);
                upgrade += Dagger.description(equipment_level);
                break;
            case Fan.name:
                details = Fan.description(0);
                upgrade += Fan.description(equipment_level);
                break;
        }

        this.details.text = details;
        this.upgrade.text = equipment_level > 0 ? upgrade : '';
        this.upgrade.set_position(this.details.group_x, this.details.group_y + this.details.height + this.render_context.space_buffer);
    }
}