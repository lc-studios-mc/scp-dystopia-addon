import {
	isPlayerCreativeOrSpectator,
	runCommandAtBlock,
} from "@mcbe-toolbox-lc/sukuriputils/server";
import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:scp143_leaves", {
		beforeOnPlayerPlace(arg) {
			arg.permutationToPlace = arg.permutationToPlace.withState("lc:by_player", true);
		},
		onPlayerBreak({ block, dimension, player }) {
			if (!player) return;
			if (isPlayerCreativeOrSpectator(player)) return;

			const maybeDropSapling = () => {
				if (Math.random() > 0.15) return;
				const itemStack = new mc.ItemStack("lc:dt_scp143_sapling_placer", 1);
				dimension.spawnItem(itemStack, block.center());
			};

			const equippable = player.getComponent("equippable")!;
			const mainhandItem = equippable.getEquipment(mc.EquipmentSlot.Mainhand);

			if (!mainhandItem || mainhandItem.typeId !== "minecraft:shears") {
				maybeDropSapling();
				return;
			}

			const itemStack = new mc.ItemStack("lc:dt_scp143_leaves", 1);
			dimension.spawnItem(itemStack, block.center());
		},
	});
});

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	const grow = (block: mc.Block) => {
		const growState = Number(block.permutation.getState("lc:growing"));

		block.dimension.spawnParticle("minecraft:crop_growth_emitter", block.center());

		if (growState < 2) {
			block.setPermutation(block.permutation.withState("lc:growing", growState + 1));
			return;
		}

		runCommandAtBlock(block, "structure load dt_scp143_tree ~-2 ~ ~-2");
	};

	blockComponentRegistry.registerCustomComponent("scpdt:scp143_sapling", {
		onRandomTick({ block }) {
			grow(block);
		},
		onPlayerInteract({ block, player }) {
			if (!player) return;

			const equippable = player.getComponent("equippable")!;
			const mainhandItem = equippable.getEquipment(mc.EquipmentSlot.Mainhand);

			if (!mainhandItem || mainhandItem.typeId !== "minecraft:bone_meal") return;

			if (!isPlayerCreativeOrSpectator(player)) {
				if (mainhandItem.amount > 1) {
					mainhandItem.amount--;
					equippable.setEquipment(mc.EquipmentSlot.Mainhand, mainhandItem);
				} else {
					equippable.setEquipment(mc.EquipmentSlot.Mainhand, undefined);
				}
			}

			grow(block);
		},
	});
});

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:scp143_log_direction", {
		beforeOnPlayerPlace(arg) {
			const blockFace = arg.permutationToPlace.getState("minecraft:block_face");
			if (typeof blockFace !== "string") return;

			let facingDirection = 0;
			switch (blockFace) {
				case "north":
				case "south":
					facingDirection = 1;
					break;
				case "east":
				case "west":
					facingDirection = 2;
					break;
			}

			arg.permutationToPlace = arg.permutationToPlace.withState(
				"lc:facing_direction",
				facingDirection,
			);
		},
	});
});
