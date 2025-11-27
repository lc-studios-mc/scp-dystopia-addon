import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:cup_pizza", {
		onConsume({ source }) {
			if (source instanceof mc.Player) {
				source.onScreenDisplay.setActionBar("It's definitely not for drink...");
			}
			source.dimension.playSound("scpdt.scp294.drink.spit", source.getHeadLocation());
		},
	});
});
