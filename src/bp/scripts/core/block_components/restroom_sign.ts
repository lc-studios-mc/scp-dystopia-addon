import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:restroom_sign", {
		onPlayerInteract({ block, player }) {
			if (!player) return;
			if (!isHoldingWrench(player)) return;

			const signState = Number(block.permutation.getState("restroom_sign:state"));
			const newSignState = signState === 0 ? 1 : 0;

			block.setPermutation(block.permutation.withState("restroom_sign:state", newSignState));
		},
	});
});
