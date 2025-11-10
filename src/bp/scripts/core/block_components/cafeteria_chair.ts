import * as mc from "@minecraft/server";
import { runCommandAtBlock } from "@mcbe-toolbox-lc/sukuriputils";
import { isHoldingWrench } from "@/lib/wrench";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:cafeteria_chair", {
		onPlayerInteract({ block, player }) {
			if (!player) return;

			const hasWrench = isHoldingWrench(player);

			if (hasWrench) {
				const currentVariant = Number(block.permutation.getState("cafeteria_chair:color"));
				const nextVariant = (currentVariant + 1) % 4;

				block.setPermutation(block.permutation.withState("cafeteria_chair:color", nextVariant));
			} else {
				runCommandAtBlock(block, "function scpdt_system/sit");
			}
		},
	});
});
