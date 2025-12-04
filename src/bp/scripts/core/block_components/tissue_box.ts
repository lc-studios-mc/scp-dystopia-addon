import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:tissue_box", {
		onPlayerInteract({ block, dimension }) {
			dimension.playSound("scpdt.tissue_pull", block.center());
			dimension.spawnItem(new mc.ItemStack("minecraft:paper", 1), block.center());
		},
	});
});
