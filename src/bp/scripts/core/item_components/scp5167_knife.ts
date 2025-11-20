import { randf } from "@/lib/math_utils";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:scp5167_knife", {
		onHitEntity({ attackingEntity }) {
			attackingEntity.dimension.playSound(
				"scpdt.scp5167.attack",
				attackingEntity.getHeadLocation(),
				{ pitch: randf(0.9, 1.1) },
			);
		},
	});
});
