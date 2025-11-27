import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:cup_iron", {
		onConsume({ source }) {
			if (source instanceof mc.Player) {
				source.onScreenDisplay.setActionBar("I'm iron hard!!");
			}
			source.dimension.playSound("scpdt.scp294.drink.ahh", source.getHeadLocation());
			source.addEffect("resistance", 15 * mc.TicksPerSecond, { amplifier: 1 });
		},
	});
});
