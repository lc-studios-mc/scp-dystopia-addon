import { runCommandAtBlock } from "@mcbe-toolbox-lc/sukuriputils/server";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:radio_block", {
		onPlayerInteract({ block, dimension, player }) {
			if (!player) return;

			const radioState = Number(block.permutation.getState("radio:states"));
			const newRadioState = radioState === 1 ? 2 : 1;

			block.setPermutation(block.permutation.withState("radio:states", newRadioState));

			if (newRadioState === 1) {
				runCommandAtBlock(block, "stopsound @a[r=11] scpdt.radio_static");
			} else {
				dimension.playSound("scpdt.radio_static", block.center());
			}
		},
		onTick({ block, dimension }) {
			const radioState = Number(block.permutation.getState("radio:states"));
			if (radioState !== 2) return;

			dimension.playSound("scpdt.radio_static", block.center());
		},
	});
});
