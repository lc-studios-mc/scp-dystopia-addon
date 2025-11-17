import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:painkillers", {
		onConsume({ source }) {
			source.addEffect("regeneration", 35 * mc.TicksPerSecond, {
				amplifier: 0,
			});
		},
	});
});
