import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:towel", {
		onPlayerInteract({ block }) {
			const towelState = Number(block.permutation.getState("towel:state"));
			block.setPermutation(block.permutation.withState("towel:state", towelState === 0 ? 1 : 0));
		},
	});
});
