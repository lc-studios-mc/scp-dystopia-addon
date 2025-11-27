import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:cup_amogus", {
		onConsume({ source }) {
			if (source instanceof mc.Player) {
				source.onScreenDisplay.setActionBar("I drank a meme... No...");
			}
			source.dimension.playSound("scpdt.scp294.drink.spit", source.getHeadLocation());
		},
	});
});
