import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:rack", {
		onPlayerInteract({ block, player }) {
			if (!player) return;
			if (!isHoldingWrench(player)) return;

			const rackState = Number(block.permutation.getState("rack:states"));
			const newRackState = rackState < 6 ? rackState + 1 : 1;

			block.setPermutation(block.permutation.withState("rack:states", newRackState));
		},
	});
});
