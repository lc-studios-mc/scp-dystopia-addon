import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:ceiling_pipe", {
		onPlayerInteract({ block, player }) {
			if (!player) return;

			const hasWrench = isHoldingWrench(player);
			if (!hasWrench) return;

			const currentVariant = Number(block.permutation.getState("ceiling_pipe:states"));
			const nextVariant = currentVariant < 3 ? currentVariant + 1 : 1;

			block.setPermutation(block.permutation.withState("ceiling_pipe:states", nextVariant));
		},
	});
});
