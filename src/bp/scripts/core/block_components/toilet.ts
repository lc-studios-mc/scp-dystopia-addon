import { sit } from "@/lib/sit";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:toilet", {
		beforeOnPlayerPlace(arg) {
			const shouldBeButtghost = Math.random() < 0.1;
			if (shouldBeButtghost) {
				arg.permutationToPlace = arg.permutationToPlace.withState("toilet:buttghost", 1);
			}
		},
		onPlayerInteract({ block, player }) {
			if (!player) return;

			const isButtghost = block.permutation.getState("toilet:buttghost") === 1;

			sit(
				player,
				block.bottomCenter(),
				isButtghost ? "lc:dt_sit_toilet_buttghost" : "lc:dt_sit_toilet",
			);
		},
		onTick({ block, dimension }) {
			const isButtghost = block.permutation.getState("toilet:buttghost") === 1;
			if (isButtghost) {
				dimension.playSound("scpdt.scp789j.butt", block.center());
			}
		},
	});
});
