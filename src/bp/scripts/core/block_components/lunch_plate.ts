import { sit } from "@/lib/sit";
import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:lunch_plate", {
		onPlayerInteract({ block, player }) {
			if (!player) return;
			if (!isHoldingWrench(player)) return;

			const hasDishes = block.permutation.getState("lunch_plate:dishes");
			block.setPermutation(block.permutation.withState("lunch_plate:dishes", !hasDishes));
		},
	});
});
