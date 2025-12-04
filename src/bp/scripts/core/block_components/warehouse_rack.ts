import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:warehouse_rack", {
		onPlayerInteract({ block, player }) {
			if (!player) return;
			if (!isHoldingWrench(player)) return;

			const rackState = Number(block.permutation.getState("rack:states"));
			block.setPermutation(
				block.permutation.withState("rack:states", rackState < 4 ? rackState + 1 : 1),
			);
		},
	});
});
