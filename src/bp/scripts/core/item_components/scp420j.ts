import { isPlayerCreativeOrSpectator } from "@mcbe-toolbox-lc/sukuriputils/server";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:scp420j", {
		onCompleteUse({ source }) {
			const equippable = source.getComponent("equippable");
			if (!equippable) return;

			const mainhandItem = equippable.getEquipment(mc.EquipmentSlot.Mainhand);
			if (!mainhandItem) return;

			const isCorrectItem = mainhandItem.getComponent("scpdt:scp420j") !== undefined;
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

			source.playSound("scpdt.scp420j.use");
			source.addEffect("nausea", 16 * mc.TicksPerSecond, { amplifier: 1 });

			const random = Math.random();
			if (random > 0.2) {
				source.onScreenDisplay.setActionBar("Aghhh... feeling good...");
			} else {
				source.addEffect("levitation", 10 * mc.TicksPerSecond, { amplifier: 0 });
				source.dimension.playSound("scpdt.fart", source.location);
				source.onScreenDisplay.setActionBar("HAHAHA FUCKIN ASSSS LETS GOOOOO");
			}
		},
	});
});
