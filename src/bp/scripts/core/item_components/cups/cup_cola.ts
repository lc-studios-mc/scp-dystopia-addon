import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:cup_cola", {
		onConsume({ source }) {
			if (source instanceof mc.Player) {
				source.onScreenDisplay.setActionBar("I'm little bit sugar high now...");
			}
			source.dimension.playSound("scpdt.scp294.drink.ahh", source.getHeadLocation());
			source.addEffect("night_vision", 15 * mc.TicksPerSecond);
		},
	});
});
