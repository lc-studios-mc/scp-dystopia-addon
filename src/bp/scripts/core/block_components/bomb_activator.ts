import { getClearanceLevel } from "@/lib/clearance_level";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:bomb_activator", {
		onPlayerInteract({ block, player, dimension }) {
			if (!player) return;

			const activatorState = Number(block.permutation.getState("bomb_activator:state"));

			if (activatorState === 3) return;

			const mainhandItem = player
				.getComponent("equippable")!
				.getEquipment(mc.EquipmentSlot.Mainhand);
			const clearanceLevel = getClearanceLevel(mainhandItem);

			if (activatorState === 0) {
				dimension.playSound("scpdt.push_button", block.center());
				if (clearanceLevel >= 6) {
					player.onScreenDisplay.setActionBar("You CAN'T cancel detonation.");
					block.setPermutation(
						block.permutation
							.withState("bomb_activator:state", 1)
							.withState("bomb_activator:textures", 1),
					);
				} else {
					player.onScreenDisplay.setActionBar("Detonation requires O5 clearance level.");
				}
				return;
			}

			if (activatorState === 1) {
				dimension.playSound("scpdt.push_button", block.center());
				dimension.playSound("scpdt.bomb_activator.activate", block.center());
				player.onScreenDisplay.setActionBar("§4/// §cDETONATING IN T-MINUS 90 SECONDS §4///");
				block.setPermutation(
					block.permutation
						.withState("bomb_activator:state", 2)
						.withState("bomb_activator:textures", 2)
						.withState("bomb_activator:explode_countdown", true),
				);
				return;
			}

			if (activatorState === 2) {
				player.onScreenDisplay.setActionBar("§cYOU CAN'T TURN OFF DETONATION");
				return;
			}
		},
		onTick({ block, dimension }) {
			const isCountingDown = Boolean(
				block.permutation.getState("bomb_activator:explode_countdown"),
			);
			if (!isCountingDown) return;

			dimension.playSound("scpdt.bomb_activator.explode", block.center());
			dimension.spawnEntity("lc:dt_bomb_activator_explode", block.center());

			block.setPermutation(
				block.permutation
					.withState("bomb_activator:state", 3)
					.withState("bomb_activator:textures", 3)
					.withState("bomb_activator:explode_countdown", false),
			);
		},
	});
});
