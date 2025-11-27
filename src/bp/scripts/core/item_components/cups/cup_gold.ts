import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:cup_gold", {
		onConsume({ source }) {
			if (source instanceof mc.Player) {
				source.onScreenDisplay.setActionBar("I feel wealthy now!!");
			}
			source.dimension.playSound("scpdt.scp294.drink.ahh", source.getHeadLocation());
			source.dimension.spawnItem(
				new mc.ItemStack("minecraft:golden_nugget", 1),
				source.getHeadLocation(),
			);
		},
	});
});
