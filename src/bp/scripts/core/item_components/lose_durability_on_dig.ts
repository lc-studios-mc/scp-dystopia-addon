import { randomInt } from "@mcbe-toolbox-lc/sukuriputils/math";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:lose_durability_on_dig", {
		onMineBlock({ source }, arg1) {
			const params = arg1.params as Record<string, unknown>;

			const equippable = source.getComponent("equippable");
			if (!equippable) return;

			const mainhandItem = equippable.getEquipment(mc.EquipmentSlot.Mainhand);
			if (!mainhandItem) return;

			const isCorrectItem = mainhandItem.getComponent("scpdt:lose_durability_on_dig") !== undefined;
			if (!isCorrectItem) return;

			const durability = mainhandItem.getComponent("durability");
			if (!durability) return;

			const unbreakingLevel = mainhandItem
				.getComponent("enchantable")
				?.getEnchantment("unbreaking")?.level;
			const damageChance = durability.getDamageChance(unbreakingLevel);
			const damageChanceRange = durability.getDamageChanceRange();

			const shouldDamage = randomInt(damageChanceRange.min, damageChanceRange.max) <= damageChance;
			if (!shouldDamage) return;

			const damageAddition = (params.damage as number | undefined) ?? 1;
			const newDamage = Math.max(
				0,
				Math.min(durability.maxDurability, durability.damage + damageAddition),
			);

			durability.damage = newDamage;
			equippable.setEquipment(mc.EquipmentSlot.Mainhand, mainhandItem);
		},
	});
});
