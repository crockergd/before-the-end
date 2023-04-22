import AbstractGroup from '../abstracts/abstractgroup';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import RenderContext from '../contexts/rendercontext';
import EquipmentInfo from '../entities/equipment/equipmentinfo';

export default class LootCard {
    public group: AbstractGroup;
    public bg: AbstractSprite;
    public frame: AbstractSprite;
    public slot: AbstractSprite;
    //  public icon: AbstractSprite;
    public title: AbstractText;
    public details: AbstractText;
    public skeleton: AbstractSprite;
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

        this.slot = this.render_context.add_sprite((this.frame.group_x - this.frame.width_half) + this.render_context.space_buffer_lg, (this.frame.group_y - this.frame.height_half) + this.render_context.space_buffer_lg, 'equipment_slot', this.group);
        this.slot.set_scale(2, 2);

        //  this.icon = this.render_context.add_sprite(this.slot.group_x, this.slot.group_y, 'equipment_icon', this.group);

        this.title = this.render_context.add_text(this.slot.group_x + this.slot.width + this.render_context.space_buffer_lg, (this.frame.group_y - this.frame.height_half) + this.render_context.space_buffer_lg - this.render_context.literal(4), '', this.group);
        this.title.set_font_size(12);
        this.title.set_word_wrap(60);

        this.details = this.render_context.add_text(this.slot.group_x, this.slot.group_y + this.slot.height + this.render_context.space_buffer_lg, '', this.group);
        this.details.set_font_size(10);
        this.details.set_word_wrap(100);

        this.stamp = this.render_context.add_sprite((this.frame.group_x - this.frame.width_half) + this.frame.width - this.render_context.literal(12), this.render_context.literal(52), 'loot_card_stamp', this.group);
        this.stamp.set_scale(2, 2);
        this.stamp.set_anchor(0.5, 0.5);
        this.stamp.set_frame(3);
    }

    public sync(equipment: EquipmentInfo): void {
        this.equipment_key = equipment.type;

        this.title.text = equipment.name;
        // this.details.text = item.description;      
        // this.slot.set_frame(item.rarity + 1);
    }
}