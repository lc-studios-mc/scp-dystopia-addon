import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:wall_sign", {
		onPlayerInteract({ block, player }) {
			if (!player) return;
			if (!isHoldingWrench(player)) return;

			const variantStateName = "wall_sign:variant";
			const variant = Number(block.permutation.getState(variantStateName));
			const nextVariant = variant < 11 ? variant + 1 : 0;
			block.setPermutation(block.permutation.withState(variantStateName, nextVariant));
		},
	});
});
