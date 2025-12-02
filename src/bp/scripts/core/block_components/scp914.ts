import { randomInt } from "@mcbe-toolbox-lc/sukuriputils/math";
import * as mc from "@minecraft/server";

const levelNames: Record<number, string> = {
	0: "Rough",
	1: "Coarse",
	2: "1:1",
	3: "Fine",
	4: "VeryFine",
};

mc.system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
	blockComponentRegistry.registerCustomComponent("scpdt:scp914", {
		onPlayerInteract({ block, dimension, player }) {
			if (!player) return;

			const refiningState = Number(block.permutation.getState("scp914:refining"));
			const level = Number(block.permutation.getState("scp914:level"));

			if (refiningState !== 0) return;

			if (player.isSneaking) {
				const newLevel = level < 4 ? level + 1 : 0;
				block.setPermutation(block.permutation.withState("scp914:level", newLevel));
				player.onScreenDisplay.setActionBar(`Set refining level to ${levelNames[newLevel]}`);
				dimension.playSound("scpdt.scp914.change_level", block.center());
				return;
			}

			const equippable = player.getComponent("equippable")!;
			const mainhandItem = equippable.getEquipment(mc.EquipmentSlot.Mainhand);

			if (!mainhandItem) {
				player.onScreenDisplay.setActionBar({ translate: "dt.guide.scp914.hold_item_or_refine" });
				return;
			}

			let newPermutation = block.permutation.withState("scp914:refining", 1);

			switch (mainhandItem.typeId) {
				case "lc:dt_mp5k_ammo":
				case "lc:dt_p90_ammo":
				case "lc:dt_m16_ammo":
				case "lc:dt_glock_ammo":
				case "lc:dt_spas12_shell":
					newPermutation = newPermutation.withState("scp914:refine_item", 1);
					break;
				case "lc:dt_keycard1":
					newPermutation = newPermutation
						.withState("scp914:refine_item", 2)
						.withState("scp914:refine_keycard", 0);
					break;
				case "lc:dt_keycard2":
					newPermutation = newPermutation
						.withState("scp914:refine_item", 2)
						.withState("scp914:refine_keycard", 1);
					break;
				case "lc:dt_keycard3":
					newPermutation = newPermutation
						.withState("scp914:refine_item", 2)
						.withState("scp914:refine_keycard", 2);
					break;
				case "lc:dt_keycard4":
					newPermutation = newPermutation
						.withState("scp914:refine_item", 2)
						.withState("scp914:refine_keycard", 3);
					break;
				case "lc:dt_keycard5":
					newPermutation = newPermutation
						.withState("scp914:refine_item", 2)
						.withState("scp914:refine_keycard", 4);
					break;
				case "lc:dt_keycard_omni":
					newPermutation = newPermutation
						.withState("scp914:refine_item", 2)
						.withState("scp914:refine_keycard", 5);
					break;
				case "lc:dt_scpdystopia_orb":
					newPermutation = newPermutation
						.withState("scp914:refine_item", 3)
						.withState("scp914:refine_orb", 0);
					break;
				case "lc:dt_enhanced_scpdystopia_orb":
					newPermutation = newPermutation
						.withState("scp914:refine_item", 3)
						.withState("scp914:refine_orb", 1);
					break;
				case "minecraft:netherite_ingot":
					newPermutation = newPermutation.withState("scp914:refine_item", 14);
					break;
				case "minecraft:diamond":
					newPermutation = newPermutation.withState("scp914:refine_item", 15);
					break;
				case "lc:dt_imposter_totem":
					newPermutation = newPermutation.withState("scp914:refine_item", 16);
					break;
				default: {
					player.onScreenDisplay.setActionBar({ translate: "dt.guide.scp914.hold_item_or_refine" });
					return;
				}
			}

			// Consume item
			if (mainhandItem.amount > 1) {
				mainhandItem.amount--;
				equippable.setEquipment(mc.EquipmentSlot.Mainhand, mainhandItem);
			} else {
				equippable.setEquipment(mc.EquipmentSlot.Mainhand, undefined);
			}

			block.setPermutation(newPermutation);
			dimension.playSound("scpdt.scp914.refine", block.center(), { volume: 1.5 });
			player.onScreenDisplay.setActionBar(`Refining the item at level §l${levelNames[level]}`);
		},
		onTick({ block, dimension }) {
			const refiningState = Number(block.permutation.getState("scp914:refining"));
			const refineItemIndex = Number(block.permutation.getState("scp914:refine_item"));
			const level = Number(block.permutation.getState("scp914:level"));
			const refineKeycardLevel = Number(block.permutation.getState("scp914:refine_keycard"));
			const refineOrbIndex = Number(block.permutation.getState("scp914:refine_orb"));

			if (refiningState !== 1) return;

			block.setPermutation(
				block.permutation.withState("scp914:refining", 0).withState("scp914:refine_item", 0),
			);

			switch (refineItemIndex) {
				// source: gun ammo/shell
				case 1: {
					if (level === 0) {
						if (Math.random() < 0.5) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_scp914_scrap"), block.center());
						} else {
							dimension.spawnItem(new mc.ItemStack("minecraft:iron_nugget"), block.center());
						}
					} else if (level === 1) {
						dimension.spawnItem(new mc.ItemStack("minecraft:gunpowder", 1), block.center());
					} else if (level === 2) {
						if (Math.random() < 0.5) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_scp914_scrap"), block.center());
						} else {
							if (Math.random() < 0.5) {
								dimension.spawnItem(new mc.ItemStack("minecraft:gunpowder", 1), block.center());
							} else {
								dimension.spawnItem(new mc.ItemStack("minecraft:iron_ingot", 1), block.center());
							}
						}
					} else if (level === 3) {
						dimension.spawnItem(
							new mc.ItemStack("minecraft:gunpowder", randomInt(2, 4)),
							block.center(),
						);
						dimension.spawnItem(
							new mc.ItemStack("minecraft:iron_ingot", randomInt(1, 3)),
							block.center(),
						);
					} else if (level === 4) {
						dimension.spawnItem(
							new mc.ItemStack("minecraft:gunpowder", randomInt(3, 6)),
							block.center(),
						);
						dimension.spawnItem(
							new mc.ItemStack("minecraft:iron_ingot", randomInt(3, 4)),
							block.center(),
						);
					}
					break;
				}

				// source: keycard
				case 2: {
					if (level === 0) {
						dimension.spawnItem(new mc.ItemStack("minecraft:paper"), block.center());
					} else if (level === 1) {
						if (refineKeycardLevel === 0) {
							dimension.spawnItem(new mc.ItemStack("minecraft:paper"), block.center());
						} else if (refineKeycardLevel === 1) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard1"), block.center());
						} else if (refineKeycardLevel === 2) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard2"), block.center());
						} else if (refineKeycardLevel === 3) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard3"), block.center());
						} else if (refineKeycardLevel === 4) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard4"), block.center());
						} else if (refineKeycardLevel === 5) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard5"), block.center());
						}
					} else if (level === 2) {
						if (refineKeycardLevel === 0) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard1"), block.center());
						} else if (refineKeycardLevel === 1) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard2"), block.center());
						} else if (refineKeycardLevel === 2) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard3"), block.center());
						} else if (refineKeycardLevel === 3) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard4"), block.center());
						} else if (refineKeycardLevel === 4) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard5"), block.center());
						} else if (refineKeycardLevel === 5) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard_omni"), block.center());
						}
					} else if (level === 3) {
						if (refineKeycardLevel === 0) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard2"), block.center());
						} else if (refineKeycardLevel === 1) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard3"), block.center());
						} else if (refineKeycardLevel === 2) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard4"), block.center());
						} else if (refineKeycardLevel === 3) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard5"), block.center());
						} else if (refineKeycardLevel === 4) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard_omni"), block.center());
						} else if (refineKeycardLevel === 5) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard_o5"), block.center());
						}
					} else if (level === 4) {
						if (refineKeycardLevel < 5) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_keycard_omni"), block.center());
						} else if (refineKeycardLevel === 5) {
							dimension.spawnEntity("lc:dt_scp5167", block.bottomCenter());
						}
					}
					break;
				}

				// source: dystopia orb
				case 3: {
					if (level === 0) {
						dimension.spawnItem(new mc.ItemStack("lc:dt_scp914_scrap"), block.center());
					} else if (level === 1) {
						if (refineOrbIndex === 0) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_scp914_scrap"), block.center());
						} else {
							dimension.spawnItem(new mc.ItemStack("lc:dt_scpdystopia_orb"), block.center());
						}
					} else if (level === 2) {
						if (refineOrbIndex === 0) {
							dimension.spawnItem(new mc.ItemStack("lc:dt_scpdystopia_orb"), block.center());
						} else {
							dimension.spawnItem(
								new mc.ItemStack("lc:dt_enhanced_scpdystopia_orb"),
								block.center(),
							);
						}
					} else if (level === 3) {
						if (refineOrbIndex === 0) {
							dimension.spawnItem(
								new mc.ItemStack("lc:dt_enhanced_scpdystopia_orb"),
								block.center(),
							);
						} else {
							dimension.spawnItem(
								new mc.ItemStack("lc:dt_enhanced_scpdystopia_orb", randomInt(1, 2)),
								block.center(),
							);
						}
					} else if (level === 4) {
						if (refineOrbIndex === 0) {
							dimension.spawnItem(
								new mc.ItemStack("lc:dt_scpdystopia_orb_block", 2),
								block.center(),
							);
						} else {
							dimension.spawnItem(new mc.ItemStack("lc:dt_imposter_totem"), block.bottomCenter());
						}
					}
					break;
				}

				// source: netherite ingot
				case 14: {
					if (level === 0) {
						dimension.spawnItem(new mc.ItemStack("minecraft:iron_ingot"), block.bottomCenter());
					} else if (level === 1) {
						dimension.spawnItem(new mc.ItemStack("minecraft:diamond"), block.bottomCenter());
					} else if (level === 2) {
						dimension.spawnItem(new mc.ItemStack("minecraft:ancient_debris"), block.bottomCenter());
					} else if (level === 3) {
						dimension.spawnItem(
							new mc.ItemStack("minecraft:netherite_ingot"),
							block.bottomCenter(),
						);
					} else if (level === 4) {
						if (Math.random() < 0.1) {
							dimension.spawnItem(
								new mc.ItemStack("minecraft:netherite_block"),
								block.bottomCenter(),
							);
						} else {
							dimension.spawnEntity("lc:dt_bomb_activator_explode", block.bottomCenter());
						}
					}
					break;
				}

				// source: diamond
				case 15: {
					if (level === 0) {
						dimension.spawnItem(new mc.ItemStack("minecraft:stone"), block.bottomCenter());
					} else if (level === 1) {
						dimension.spawnItem(new mc.ItemStack("minecraft:raw_iron"), block.bottomCenter());
					} else if (level === 2) {
						dimension.spawnItem(new mc.ItemStack("minecraft:diamond_ore"), block.bottomCenter());
					} else if (level === 3) {
						dimension.spawnItem(new mc.ItemStack("minecraft:diamond"), block.bottomCenter());
					} else if (level === 4) {
						dimension.spawnItem(new mc.ItemStack("minecraft:diamond"), block.bottomCenter());
						dimension.spawnItem(new mc.ItemStack("minecraft:diamond"), block.bottomCenter());
					}
					break;
				}

				// source: imposter totem
				case 16: {
					if (level === 2) {
						dimension.spawnItem(new mc.ItemStack("lc:dt_imposter_totem"), block.bottomCenter());
					} else if (level === 3) {
						dimension.spawnEntity("lc:dt_scp5167", block.bottomCenter());
					} else if (level === 4) {
						dimension.spawnEntity("lc:dt_scp5167_boss", block.bottomCenter());
					}
					break;
				}
			}
		},
	});
});
