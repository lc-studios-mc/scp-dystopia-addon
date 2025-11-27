import { runCommandAtBlock } from "@mcbe-toolbox-lc/sukuriputils/server";
import * as vecarr from "@mcbe-toolbox-lc/vecarr";
import * as mc from "@minecraft/server";
import { vec3 } from "gl-matrix";

const playSoundToNearbyPlayers = (block: mc.Block, soundId: string): void => {
	block.dimension.getPlayers().forEach((player) => {
		const dist = vec3.dist(vecarr.toArr3(player.location), vecarr.toArr3(block.center()));
		if (dist > 128) return;
		player.playSound(soundId);
	});
};

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:scp079", {
		onTick({ block }) {
			const scp079State = Number(block.permutation.getState("scp079:states"));

			if (scp079State === 2) {
				playSoundToNearbyPlayers(block, "scpdt.scp079.broadcast");
				block.setPermutation(block.permutation.withState("scp079:states", 3));
			} else if (scp079State === 3) {
				playSoundToNearbyPlayers(block, "scpdt.scp079.broadcast");
			}
		},
		onPlayerInteract({ block }) {
			const scp079State = Number(block.permutation.getState("scp079:states"));

			if (scp079State === 1) {
				playSoundToNearbyPlayers(block, "scpdt.scp079.booting");
				block.setPermutation(block.permutation.withState("scp079:states", 2));
			} else if (scp079State === 3) {
				playSoundToNearbyPlayers(block, "scpdt.scp079.shutdown");
				runCommandAtBlock(block, "stopsound @a scpdt.scp079.broadcast");
				block.setPermutation(block.permutation.withState("scp079:states", 1));
			}
		},
	});
});
