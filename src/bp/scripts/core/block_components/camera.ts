import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:camera", {
		onPlayerInteract({ block, player }) {
			if (!player) return;

			const hasWrench = isHoldingWrench(player);
			if (!hasWrench) return;

			const currentVariant = Number(block.permutation.getState("camera:variant"));
			const nextVariant = (currentVariant + 1) % 4;

			block.setPermutation(block.permutation.withState("camera:variant", nextVariant));
		},
	});
});
