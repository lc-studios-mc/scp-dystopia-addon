import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:poster", {
		onPlayerInteract({ block, player }) {
			if (!player) return;
			if (!isHoldingWrench(player)) return;

			const variantStateName = "poster:variant";
			const variant = Number(block.permutation.getState(variantStateName));
			const nextVariant = variant < 4 ? variant + 1 : 0;
			block.setPermutation(block.permutation.withState(variantStateName, nextVariant));
		},
	});
});
