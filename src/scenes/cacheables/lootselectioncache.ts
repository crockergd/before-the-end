import AbstractButton from '../../abstracts/abstractbutton';
import AbstractDepth from '../../abstracts/abstractdepth';
import AbstractGroup from '../../abstracts/abstractgroup';
import AbstractScene from '../../abstracts/abstractscene';
import AbstractSprite from '../../abstracts/abstractsprite';
import AbstractText from '../../abstracts/abstracttext';
import Entity from '../../entities/entity';
import * as Equips from '../../entities/equipment';
import Equipment from '../../entities/equipment/equipment';
import EquipmentInfo from '../../entities/equipment/equipmentinfo';
import LootCard from '../../ui/lootcard';
import TransitionType from '../../ui/transitiontype';
import CallbackBinding from '../../utils/callbackbinding';
import Constants from '../../utils/constants';
import ObjectExtensions from '../../utils/objectextensions';
import Vector from '../../utils/vector';
import Cacheable from './cacheable';

export default class LootSelectionCache extends Cacheable {
    public group: AbstractGroup;
    public bg: AbstractSprite;
    public cards: Array<LootCard>;
    public fill: AbstractSprite;
    public banner: AbstractSprite;
    public title: AbstractText;
    public confirm: AbstractButton;

    public max_cards: number = 3;
    private selected_card: LootCard;

    public get active(): boolean {
        return this.group.visible;
    }

    constructor(scene: AbstractScene) {
        super(scene);

        this.cards = new Array<LootCard>();
        this.group = this.render_context.add_group();
        this.group.set_depth(AbstractDepth.ACTIVE_WINDOW);

        this.bg = this.render_context.add_sprite(this.render_context.center_x, this.render_context.center_y, 'loot_frame', this.group);
        this.bg.set_scale(2, 2);
        this.bg.set_anchor(0.5, 0.5);

        this.banner = this.render_context.add_sprite(Math.ceil(this.render_context.center_x), this.bg.group_y - this.bg.height_half + this.render_context.literal(46), 'loot_frame_banner', this.group);
        this.banner.set_scale(2, 2);
        this.banner.set_anchor(0.5, 0);

        this.title = this.render_context.add_text(this.banner.group_x, this.banner.group_y + this.banner.height_half - this.render_context.literal(2), '', this.group);
        this.title.set_font_size(12);
        this.title.set_anchor(0.5, 0.5);

        this.confirm = this.render_context.add_button(this.bg.group_x, this.bg.group_y + this.bg.height_half - this.render_context.literal(3), 'ability_btn_sm', 'Confirm', this.group);
        this.confirm.set_scale(2, 2);
        this.confirm.set_font_size(12);
        this.confirm.set_position(-(this.confirm.width / 2), -(this.confirm.height / 2), true);

        for (let i: number = 0; i < this.max_cards; i++) {
            const card: LootCard = new LootCard(this.render_context, this.group);
            this.cards.push(card);
        }

        this.hide();
    }

    public present(player: Entity, equips: Array<EquipmentInfo>, on_complete?: CallbackBinding): void {
        this.confirm.off();
        this.confirm.once(Constants.TAP_EVENT, () => {
            if (!this.selected_card) return;

            this.assign_item(player, this.selected_card);

            this.render_context.transition_component(TransitionType.OUT, this.group, new Vector(0, 0), 200, true, new CallbackBinding(() => {
                on_complete?.call(this.selected_card);
            }, this));
        }, this);

        const count: number = equips.length;
        const max_iter: number = Math.min(this.max_cards, count);

        for (let i: number = 0; i < max_iter; i++) {
            const equipment: EquipmentInfo = ObjectExtensions.array_access(equips, i);
            const card: LootCard = ObjectExtensions.array_access(this.cards, i);

            card.sync(equipment);
        }

        this.title.text = 'Equipment discovered';

        this.reorder(count);

        for (const card of this.cards) {
            card.frame.off();
            card.frame.on(Constants.TAP_EVENT, () => {
                for (const inner of this.cards) {
                    inner.stamp.set_visible(false);
                }

                card.stamp.set_visible(true);
                card.stamp.play('loot_card_stamp_show', null, null, new CallbackBinding(() => {
                    card.stamp.play('loot_card_stamp_flow');
                }, this));
                this.selected_card = card;
            }, this);

            card.stamp.set_visible(false);
        }

        this.group.set_visible(true);

        this.render_context.transition_component(TransitionType.IN, this.group, new Vector(0, 0), 200, true);
    }

    public reorder(count: number): void {
        const card_dimensions: Vector = this.render_context.get_dimensions('loot_card_bg', undefined, true);
        card_dimensions.multiply(2);
        const buffer: number = this.render_context.space_buffer * 2;
        const width_adj: number = this.render_context.center_x - (((card_dimensions.width * count) / 2) + (buffer * Math.max(0, (count - 1)) / 2));
        const height_adj: number = this.render_context.center_y - (card_dimensions.height / 2) + this.render_context.literal(40);

        for (const card of this.cards) {
            card.group.set_visible(false);
        }

        for (let i: number = 0; i < count; i++) {
            const card: LootCard = ObjectExtensions.array_access(this.cards, i);

            card.group.set_position(width_adj + (card_dimensions.width * i) + (buffer * i), height_adj);
            card.group.set_visible(true);
        }
    }

    public assign_item(player: Entity, card: LootCard): void {
        const equipment_type: any = Object.values(Equips).find(type => type.name === card.equipment_key);
        const equipment: Equipment = new equipment_type.prototype.constructor(this.scene, this.render_context);

        player.add_equipment(equipment);
    }

    public hide(): void {
        this.group.set_visible(false);
    }
}