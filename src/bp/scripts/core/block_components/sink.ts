import { runCommandAtBlock } from "@mcbe-toolbox-lc/sukuriputils/server";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:sink", {
		onPlayerInteract({ block, dimension, player }) {
			if (!player) return;

			const sinkState = Number(block.permutation.getState("sink:states"));
			block.setPermutation(block.permutation.withState("sink:states", sinkState === 1 ? 2 : 1));

			if (sinkState === 1) {
				dimension.playSound("scpdt.sink_water", block.center());
			} else {
				runCommandAtBlock(block, "stopsound @a[r=15] scpdt.sink_water");
			}
		},
		onTick({ block, dimension }) {
			dimension.playSound("scpdt.sink_water", block.center());
		},
	});
});
