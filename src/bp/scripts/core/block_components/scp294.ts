import * as mc from "@minecraft/server";
import { vec3 } from "gl-matrix";
import * as vecarr from "@mcbe-toolbox-lc/vecarr";

const productLabelsByWordIndex: Record<number, string> = {
	0: "Water",
	1: "Coffee",
	2: "Orange Juice",
	3: "Cola",
	4: "Iron",
	5: "Gold",
	6: "Pizza",
	7: "Me",
	8: "Boyfriend",
	9: "Girlfriend",
	10: "Amogus",
};

const productIdsByWordIndex: Record<number, string> = {
	0: "lc:dt_cup_water",
	1: "lc:dt_cup_coffee",
	2: "lc:dt_cup_orange_juice",
	3: "lc:dt_cup_cola",
	4: "lc:dt_cup_iron",
	5: "lc:dt_cup_gold",
	6: "lc:dt_cup_pizza",
	7: "lc:dt_cup_me",
	8: "lc:dt_cup_boyfriend",
	9: "lc:dt_cup_girlfriend",
	10: "lc:dt_cup_amogus",
};

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:scp294", {
		onPlayerInteract({ block, dimension, player }) {
			if (!player) return;

			const dispenseState = Number(block.permutation.getState("scp294:dispense"));
			const coinState = Number(block.permutation.getState("scp294:coin"));
			const wordIndex = Number(block.permutation.getState("scp294:word"));

			if (dispenseState === 1) return; // Return if dispensing

			const equippable = player.getComponent("equippable")!;
			const mainhandSlot = equippable.getEquipmentSlot(mc.EquipmentSlot.Mainhand);
			const consumeMainhandItem = () => {
				if (mainhandSlot.amount > 1) {
					mainhandSlot.amount--;
				} else {
					mainhandSlot.setItem(undefined);
				}
			};

			// Coin first
			if (coinState === 0) {
				if (!mainhandSlot.hasItem() || mainhandSlot.typeId !== "lc:dt_coin") {
					player.onScreenDisplay.setActionBar({ translate: "dt.guide.scp294.coin_required" });
					return;
				}

				consumeMainhandItem();
				dimension.playSound("scpdt.scp294.coin", block.center());
				block.setPermutation(block.permutation.withState("scp294:coin", 1));

				return;
			}

			// Cycle word
			if (player.isSneaking) {
				const nextWordIndex = wordIndex < 10 ? wordIndex + 1 : 0;
				const nextProductLabel = productLabelsByWordIndex[nextWordIndex]!;
				const currentProductLabel = productLabelsByWordIndex[wordIndex]!;

				player.onScreenDisplay.setActionBar(
					`§7Word: §8${currentProductLabel} §7-> §f${nextProductLabel}`,
				);
				dimension.playSound("scpdt.push_button", block.center());
				block.setPermutation(block.permutation.withState("scp294:word", nextWordIndex));

				return;
			}

			if (!mainhandSlot.hasItem() || mainhandSlot.typeId !== "lc:dt_empty_cup") {
				player.onScreenDisplay.setActionBar({
					translate: "dt.guide.scp294.empty_cup_required_or_cycle",
				});
				return;
			}

			consumeMainhandItem();
			player.onScreenDisplay.setActionBar("§7Dispensing...");
			block.setPermutation(block.permutation.withState("scp294:dispense", 1));

			// Dispense sound
			switch (wordIndex) {
				case 0:
				case 1:
				case 2:
				case 3:
					dimension.playSound("scpdt.scp294.dispense1", block.center());
					break;
				case 4:
				case 5:
				case 6:
				case 10:
					dimension.playSound("scpdt.scp294.dispense2", block.center());
					break;
				case 7:
				case 8:
				case 9:
					dimension.playSound("scpdt.scp294.dispense3", block.center());
					break;
			}
		},
		onTick({ block, dimension }) {
			const dispenseState = Number(block.permutation.getState("scp294:dispense"));
			const wordIndex = Number(block.permutation.getState("scp294:word"));

			if (dispenseState !== 1) return; // Return if NOT dispensing

			block.setPermutation(block.permutation.withState("scp294:coin", 0));
			block.setPermutation(block.permutation.withState("scp294:dispense", 0));

			const cupId = productIdsByWordIndex[wordIndex]!;
			const itemStack = new mc.ItemStack(cupId, 1);
			const blockCenter = block.center();
			const itemEntity = dimension.spawnItem(itemStack, {
				x: blockCenter.x,
				y: blockCenter.y + 1,
				z: blockCenter.z,
			});

			const nearestPlayer = dimension.getPlayers({
				location: itemEntity.location,
				closest: 1,
				maxDistance: 5,
			})[0];

			if (!nearestPlayer) return;

			const force = vec3.sub(
				vec3.create(),
				vecarr.toArr3(nearestPlayer.getHeadLocation()),
				vecarr.toArr3(itemEntity.location),
			);

			itemEntity.applyImpulse(vecarr.toObj3(force));
		},
	});
});
