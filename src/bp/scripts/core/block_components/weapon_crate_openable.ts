import { isHoldingWrench } from "@/lib/wrench";
import * as mc from "@minecraft/server";

const lootLabelsByIndex: Record<number, string> = {
	0: "Random",
	1: "Melee weapons",
	2: "Foods",
	3: "Pistols",
	4: "SMGs",
	5: "Rifles",
	6: "Special firearms",
	7: "Pistol magazines",
	8: "SMG magazines",
	9: "Rifle magazines",
	10: "Misc gun magazines",
	11: "Bow",
	12: "Arrows",
};

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:weapon_crate_openable", {
		onPlayerInteract({ block, dimension, player }) {
			if (!player) return;

			const crateState = Number(block.permutation.getState("crate:state"));
			const lootIndex = Number(block.permutation.getState("crate:loot"));

			if (!isHoldingWrench(player)) {
				if (crateState === 0) {
					// Spawn loot items
					const lootItemStacks = mc.world
						.getLootTableManager()
						.generateLootFromBlockPermutation(block.permutation);
					if (lootItemStacks) {
						lootItemStacks.forEach((itemStack) => {
							dimension.spawnItem(itemStack, block.center());
						});
					}

					block.setPermutation(block.permutation.withState("crate:state", 1));
					dimension.playSound("random.chestopen", block.center(), { volume: 0.6 });
				}

				return;
			}

			// Change loot below

			const nextLootIndex = lootIndex < 12 ? lootIndex + 1 : 0;
			const nextLootLabel = lootLabelsByIndex[nextLootIndex];

			if (nextLootLabel) player.onScreenDisplay.setActionBar(`Set loot to: §l${nextLootLabel}`);

			block.setPermutation(block.permutation.withState("crate:loot", nextLootIndex));
		},
	});
});
