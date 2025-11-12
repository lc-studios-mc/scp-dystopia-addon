import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:catwalk_fence", {
		onPlayerInteract({ block, player }) {
			if (!player) return;

			const hasWrench = isHoldingWrench(player);
			if (!hasWrench) return;

			const currentVariant = Number(block.permutation.getState("fence:variant"));
			const nextVariant = (currentVariant + 1) % 3;

			block.setPermutation(block.permutation.withState("fence:variant", nextVariant));
		},
	});
});
