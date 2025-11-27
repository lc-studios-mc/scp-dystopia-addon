import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:cup_boyfriend", {
		onConsume({ source }) {
			if (source instanceof mc.Player) {
				source.onScreenDisplay.setActionBar("Uh... damn, it tastes weird...");
			}
			source.dimension.playSound("scpdt.scp294.drink.cough", source.getHeadLocation());
		},
	});
});
