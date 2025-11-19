import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:scp714", {
		onUse({ source }) {
			source.dimension.playSound("scpdt.scp714.use", source.getHeadLocation());
			source.addEffect("resistance", 30 * mc.TicksPerSecond, { amplifier: 3 });
			source.addEffect("slowness", 30 * mc.TicksPerSecond, { amplifier: 1 });
		},
	});
});
