import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:cup_me", {
		onConsume({ source }) {
			source.dimension.playSound("scpdt.scp294.drink.vomit", source.getHeadLocation());
			source.applyDamage(45451919, {
				cause: mc.EntityDamageCause.selfDestruct,
				damagingEntity: source,
			});
		},
	});
});
