import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.blockComponentRegistry.registerCustomComponent("scpdt:scp006", {
		onStepOn({ entity }) {
			entity?.addEffect("regeneration", 4 * mc.TicksPerSecond, { amplifier: 1 });
		},
	});
});
