import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:hand_dryer", {
		onPlayerInteract({ block, dimension, player }) {
			if (!player) return;

			const dryerState = Number(block.permutation.getState("hand_dryer:states"));
			if (dryerState === 2) return;

			block.setPermutation(block.permutation.withState("hand_dryer:states", 2));
			dimension.playSound("scpdt.hand_dryer", block.center());
		},
		onTick({ block }) {
			const dryerState = Number(block.permutation.getState("hand_dryer:states"));
			if (dryerState === 1) return;

			block.setPermutation(block.permutation.withState("hand_dryer:states", 1));
		},
	});
});
