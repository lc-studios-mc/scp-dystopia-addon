import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:dont_damage_durability_on_hit", {
		onBeforeDurabilityDamage(arg) {
			arg.durabilityDamage = 0;
		},
	});
});
