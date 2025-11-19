import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:scp207", {
		onConsume({ source }) {
			source.dimension.playSound("scpdt.scp294.drink.ew", source.getHeadLocation());

			source.addEffect("speed", 180 * mc.TicksPerSecond, { amplifier: 3 });
			source.addEffect("wither", 180 * mc.TicksPerSecond, { amplifier: 0 });
		},
	});
});
