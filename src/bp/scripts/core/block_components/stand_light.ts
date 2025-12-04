import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:stand_light", {
		onPlayerInteract({ block, player }) {
			if (!player) return;

			const isLit = Boolean(block.permutation.getState("stand_light:lit"));
			block.setPermutation(block.permutation.withState("stand_light:lit", !isLit));
		},
	});
});
