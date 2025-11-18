import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:scp063", {
		onUse({ source }) {
			source.addEffect("haste", 10 * mc.TicksPerSecond, {
				amplifier: 3,
			});
		},
	});
});
