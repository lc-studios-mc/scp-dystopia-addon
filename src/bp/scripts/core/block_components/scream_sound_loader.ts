import * as v from "@mcbe-toolbox-lc/vecarr";
import * as mc from "@minecraft/server";
import { vec3 } from "gl-matrix";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:scream_sound_loader", {
		onPlayerInteract({ block, dimension }) {
			const isBroadcasting = !!block.permutation.getState("intercom:broadcasting");
			if (isBroadcasting) return;

			block.setPermutation(block.permutation.withState("intercom:broadcasting", true));

			dimension.playSound("scpdt.scream_loader.scream", block.center(), {
				volume: 5,
			});
		},
		onTick({ block, dimension }) {
			const isBroadcasting = !!block.permutation.getState("intercom:broadcasting");
			if (!isBroadcasting) return;

			block.setPermutation(block.permutation.withState("intercom:broadcasting", false));

			const scp106 = dimension.getEntities({
				families: ["scp106"],
				closest: 1,
				location: block.center(),
			})[0];

			if (!scp106) return;

			const scp106Container = dimension.getEntities({
				type: "lc:dt_scp106_container",
				closest: 1,
				maxDistance: 32,
				location: block.center(),
			})[0];

			const scp106TpLocation = scp106Container
				? scp106Container.location
				: v.toObj3(vec3.add(vec3.create(), v.toArr3(block.bottomCenter()), [0, 1.1, 0]));

			scp106.teleport(scp106TpLocation);
			dimension.playSound("scpdt.scp106.spawn", scp106TpLocation, { volume: 1.3 });

			if (scp106Container) {
				scp106Container.getComponent("minecraft:rideable")!.addRider(scp106);
			}
		},
	});
});
