import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:blast_door", {
		onPlace({ block, dimension }) {
			const clearanceLevel = Number(block.permutation.getState("scpdt:clearance_level"));
		},
	});
});
