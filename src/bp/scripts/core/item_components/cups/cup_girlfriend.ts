import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:cup_girlfriend", {
		onConsume({ source }) {
			if (source instanceof mc.Player) {
				source.onScreenDisplay.setActionBar("It reminds me of... never mind.");
			}
			source.dimension.playSound("scpdt.scp294.drink.ew", source.getHeadLocation());
		},
	});
});
