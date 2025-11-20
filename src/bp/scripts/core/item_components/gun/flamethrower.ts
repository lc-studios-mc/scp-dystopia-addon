import * as mc from "@minecraft/server";

const shootProjectile = (source: mc.Player, projectileType: string) => {
	const flameEntity = source.dimension.spawnEntity(projectileType, source.getHeadLocation());
	const flameProjectileComp = flameEntity.getComponent("projectile")!;
	flameProjectileComp.owner = source;
	flameProjectileComp.shoot(source.getViewDirection());
};

const shootProjectileTwice = (source: mc.Player, projectileType: string) => {
	shootProjectile(source, projectileType);
	mc.system.runTimeout(() => {
		shootProjectile(source, projectileType);
	}, 2);
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:flamethrower", {
		onUse({ source, itemStack }) {
			if (!itemStack) return;

			const equippable = source.getComponent("equippable");
			if (!equippable) return;

			const isCorrectItem =
				equippable.getEquipment(mc.EquipmentSlot.Mainhand)?.type === itemStack.type;
			if (!isCorrectItem) return;

			const durability = itemStack.getComponent("durability")!;

			const shouldReplaceWithEmpty = durability.maxDurability - durability.damage <= 1;
			if (shouldReplaceWithEmpty) {
				source.dimension.playSound("scpdt.gun.shot_dry", source.getHeadLocation());
				const emptyItem = new mc.ItemStack("lc:dt_flamethrower_empty");
				equippable.setEquipment(mc.EquipmentSlot.Mainhand, emptyItem);
				return;
			}

			durability.damage++;
			equippable.setEquipment(mc.EquipmentSlot.Mainhand, itemStack);

			source.dimension.playSound("scpdt.flamethrower.fire", source.getHeadLocation());
			source.playAnimation("animation.dt_misc.player_gun_fire");
			source.runCommand("tp @s[tag=gun_recoil_on] ~~~ facing ^ ^0.02 ^1");

			if (!source.isOnGround) {
				source.runCommand("camerashake add @s 0.5 0.23 rotational");
				source.onScreenDisplay.setActionBar("§c(         §f+         §c)");
				shootProjectileTwice(source, "lc:dt_flame_player_uncertain");
			} else if (!source.isSneaking) {
				source.runCommand("camerashake add @s 0.17 0.23 rotational");
				source.onScreenDisplay.setActionBar("§c(    §f+    §c)");
				shootProjectileTwice(source, "lc:dt_flame_player");
			} else {
				source.runCommand("camerashake add @s 0.13 0.37 rotational");
				source.onScreenDisplay.setActionBar("§c(  §f+  §c)");
				shootProjectileTwice(source, "lc:dt_flame_player_sneak");
			}
		},
	});
});

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:flamethrower_empty", {
		onUse({ source, itemStack }) {
			if (!itemStack) return;

			const equippable = source.getComponent("equippable");
			if (!equippable) return;

			const isCorrectItem =
				equippable.getEquipment(mc.EquipmentSlot.Mainhand)?.type === itemStack.type;
			if (!isCorrectItem) return;

			if (source.getItemCooldown("dt_ft_reloading") > 0) {
				source.onScreenDisplay.setActionBar({ translate: "dt.guide.still_reloading" });
				return;
			}

			const durability = itemStack.getComponent("durability")!;

			const shouldReplaceWithLoaded = durability.maxDurability - durability.damage <= 1;
			if (shouldReplaceWithLoaded) {
				source.dimension.playSound("scpdt.gun.reload_complete", source.getHeadLocation());
				const emptyItem = new mc.ItemStack("lc:dt_flamethrower");
				equippable.setEquipment(mc.EquipmentSlot.Mainhand, emptyItem);
				return;
			}

			const offhandItem = equippable.getEquipment(mc.EquipmentSlot.Offhand);
			if (!offhandItem || offhandItem.typeId !== "lc:dt_flamethrower_fuel") {
				source.onScreenDisplay.setActionBar({ translate: "dt.guide.equip_mag_on_offhand" });
				return;
			}

			equippable.setEquipment(mc.EquipmentSlot.Offhand, undefined);

			durability.damage++;
			equippable.setEquipment(mc.EquipmentSlot.Mainhand, itemStack);

			source.startItemCooldown("dt_ft_reloading", 7.63 * mc.TicksPerSecond);
			source.playAnimation("animation.dt_misc.gun_reload_extra_long");
			source.dimension.playSound("scpdt.flamethrower.reload", source.getHeadLocation());
			source.addEffect("slowness", 7 * mc.TicksPerSecond, { amplifier: 1 });
		},
	});
});
