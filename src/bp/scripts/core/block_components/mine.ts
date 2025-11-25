import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:mine", {
		onStepOn({ block, dimension }) {
			block.setType("minecraft:air");
			dimension.spawnEntity("lc:dt_mine_explosion", block.bottomCenter());
		},
	});
});
