import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:big_number_sign", {
		onPlayerInteract({ block, player }) {
			if (!player) return;

			const hasWrench = isHoldingWrench(player);
			if (!hasWrench) return;

			const state = Number(block.permutation.getState("sign:state"));
			const nextState = (state + 1) % 10;

			block.setPermutation(block.permutation.withState("sign:state", nextState));
		},
	});
});
