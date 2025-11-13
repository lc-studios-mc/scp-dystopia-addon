import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:medkit", {
		onConsume({ source }) {
			source.addEffect("regeneration", 20 * mc.TicksPerSecond, {
				amplifier: 2,
			});
		},
	});
});
