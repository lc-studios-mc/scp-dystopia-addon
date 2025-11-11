import { sit } from "@/lib/sit";
import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

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
				sit(player, block.bottomCenter());
			}
		},
	});
});
