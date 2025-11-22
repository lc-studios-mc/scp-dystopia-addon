import { isPlayerCreativeOrSpectator } from "@mcbe-toolbox-lc/sukuriputils/server";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:coffee_machine", {
		onPlayerInteract({ block, dimension, player }) {
			if (!player) return;

			const vendingState = Number(block.permutation.getState("coffee:vending_states"));
			if (vendingState === 2) return; // Stop if currently pouring

			const equippable = player.getComponent("equippable");
			if (!equippable) return;

			const mainhandItem = equippable.getEquipment(mc.EquipmentSlot.Mainhand);
			if (!mainhandItem || mainhandItem.typeId !== "lc:dt_empty_mug") return;

			// Consume item
			if (!isPlayerCreativeOrSpectator(player)) {
				if (mainhandItem.amount > 1) {
					mainhandItem.amount--;
					equippable.setEquipment(mc.EquipmentSlot.Mainhand, mainhandItem);
				} else {
					equippable.setEquipment(mc.EquipmentSlot.Mainhand, undefined);
				}
			}

			block.setPermutation(
				block.permutation.withState("coffee:vending", true).withState("coffee:vending_states", 2),
			);

			dimension.playSound("scpdt.coffee_machine.vending", block.center());
		},
		onTick({ block, dimension }) {
			const vendingState = Number(block.permutation.getState("coffee:vending_states"));

			if (vendingState === 1) return; // Stop if NOT pouring

			dimension.spawnItem(new mc.ItemStack("lc:dt_coffee_mug"), block.center());

			block.setPermutation(
				block.permutation.withState("coffee:vending", false).withState("coffee:vending_states", 1),
			);
		},
	});
});
