import * as mc from "@minecraft/server";

type ComponentParams = {
	clearanceLevel: number;
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:blast_door", {
		onPlace({ block, dimension }, arg1) {
			const params = arg1.params as ComponentParams;
		},
	});
});
