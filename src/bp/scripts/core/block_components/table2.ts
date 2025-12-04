import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:table2", {
		onPlayerInteract({ block, player }) {
			if (!player) return;
			if (!isHoldingWrench(player)) return;

			const currentVariant = Number(block.permutation.getState("table2:variant"));
			const nextVariant = currentVariant < 6 ? currentVariant + 1 : 1;

			block.setPermutation(block.permutation.withState("table2:variant", nextVariant));
		},
	});
});
