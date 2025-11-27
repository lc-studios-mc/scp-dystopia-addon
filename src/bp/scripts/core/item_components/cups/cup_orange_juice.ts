import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:cup_orange_juice", {
		onConsume({ source }) {
			if (source instanceof mc.Player) {
				source.onScreenDisplay.setActionBar("Wow, fresh orange!");
			}
			source.dimension.playSound("scpdt.scp294.drink.ahh", source.getHeadLocation());
		},
	});
});
