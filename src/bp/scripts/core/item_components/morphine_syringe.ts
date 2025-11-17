import { isPlayerCreativeOrSpectator } from "@mcbe-toolbox-lc/sukuriputils/server";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:morphine_syringe", {
		onCompleteUse({ source }) {
			const equippable = source.getComponent("equippable");
			if (!equippable) return;

			const mainhandItem = equippable.getEquipment(mc.EquipmentSlot.Mainhand);
			if (!mainhandItem) return;

			const isCorrectItem = mainhandItem.getComponent("scpdt:morphine_syringe") !== undefined;
			if (!isCorrectItem) return;

			// Consume item
			if (!isPlayerCreativeOrSpectator(source)) {
				if (mainhandItem.amount > 1) {
					mainhandItem.amount--;
					equippable.setEquipment(mc.EquipmentSlot.Mainhand, mainhandItem);
				} else {
					equippable.setEquipment(mc.EquipmentSlot.Mainhand, undefined);
				}
			}

			const random = Math.random();
			if (random > 0.035) {
				const health = Number(source.getComponent("health")?.currentValue);
				if (health > 15) {
					source.onScreenDisplay.setActionBar("Ugh... it's good...?");
				} else if (health > 8) {
					source.onScreenDisplay.setActionBar("I shouldn't use this in short period of time...");
				} else if (health > 0) {
					source.onScreenDisplay.setActionBar("It's killing me...");
				}

				source.dimension.playSound("scpdt.morphine.use", source.getHeadLocation());
				source.applyDamage(2, { cause: mc.EntityDamageCause.override });
				source.addEffect("wither", 4 * mc.TicksPerSecond, { amplifier: 3 });
				source.addEffect("nausea", 8 * mc.TicksPerSecond, { amplifier: 1 });
				source.addEffect("mining_fatigue", 60 * mc.TicksPerSecond, { amplifier: 0 });
				source.addEffect("resistance", 40 * mc.TicksPerSecond, { amplifier: 1 });
				source.addEffect("regeneration", 20 * mc.TicksPerSecond, { amplifier: 0 });
			} else {
				source.kill();
			}
		},
	});
});
