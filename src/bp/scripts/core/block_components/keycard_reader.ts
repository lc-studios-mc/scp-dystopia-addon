import * as mc from "@minecraft/server";
import { runCommandAtBlock } from "@mcbe-toolbox-lc/sukuriputils/server";
import { getEntityClearanceLevel } from "@/lib/clearance_level";

type ComponentParams = {
	clearanceLevel: number;
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:keycard_reader", {
		onPlayerInteract({ block, player }, arg1) {
			const params = arg1.params as ComponentParams;

			if (!player) return;

			const requiredClearanceLevel = params.clearanceLevel;
			const playerClearanceLevel = getEntityClearanceLevel(player);

			if (playerClearanceLevel < requiredClearanceLevel) {
				player.onScreenDisplay.setActionBar({ translate: "dt.guide.not_enough_clearance" });
				return;
			}

			runCommandAtBlock(block, "function scpdt_system/key_read");
		},
	});
});
