import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:scp500", {
		onConsume({ source }) {
			source.removeEffect("wither");
			source.removeEffect("poison");
			source.removeEffect("slowness");
			source.removeEffect("mining_fatigue");
			source.removeEffect("nausea");
			source.removeEffect("blindness");
			source.removeEffect("weakness");
			source.removeEffect("hunger");
			source.removeEffect("instant_damage");
			source.extinguishFire();

			source.addEffect("regeneration", 60 * mc.TicksPerSecond, { amplifier: 3 });
			source.addEffect("absorption", 60 * mc.TicksPerSecond, { amplifier: 3 });
		},
	});
});
