import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:cup_water", {
		onConsume({ source }) {
			if (source instanceof mc.Player) {
				source.onScreenDisplay.setActionBar("Mmm, feeling fresh.");
			}
			source.dimension.playSound("scpdt.scp294.drink.ahh", source.getHeadLocation());
		},
	});
});
