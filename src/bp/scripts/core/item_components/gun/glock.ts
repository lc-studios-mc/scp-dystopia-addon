import * as v from "@mcbe-toolbox-lc/vecarr";
import * as mc from "@minecraft/server";
import { vec3 } from "gl-matrix";

const componentName = "scpdt:glock";
const componentNameEmpty = "scpdt:glock_empty";
const itemType = "lc:dt_glock";
const emptyItemType = "lc:dt_glock_empty";
const magItemType = "lc:dt_glock_mag";
const emptyMagItemType = "lc:dt_glock_mag_empty";
const bulletTypeUncertain = "lc:dt_glock_bullet_player_uncertain";
const bulletTypeNormal = "lc:dt_glock_bullet_player";
const bulletTypeSneak = "lc:dt_glock_bullet_player_sneak";
const shootingSound = "scpdt.glock.shot";
const reloadingCooldownCategory = "dt_glock_reloading";
const reloadingSound = "scpdt.glock.reload";

const shootProjectile = (source: mc.Player, projectileType: string, launchPower: number) => {
	const projectile = source.dimension.spawnEntity(projectileType, source.getHeadLocation());
	const projectileComp = projectile.getComponent("projectile")!;
	projectileComp.owner = source;
	const force = vec3.scale(vec3.create(), v.toArr3(source.getViewDirection()), launchPower);
	projectileComp.shoot(v.toObj3(force));
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent(componentName, {
		onUse({ source, itemStack }) {
			if (!itemStack) return;

			const equippable = source.getComponent("equippable");
			if (!equippable) return;

			const durability = itemStack.getComponent("durability")!;

			const shouldReplaceWithEmpty = durability.maxDurability - durability.damage <= 1;
			if (shouldReplaceWithEmpty) {
				source.dimension.playSound("scpdt.gun.shot_dry", source.getHeadLocation());
				const emptyItem = new mc.ItemStack(emptyItemType);
				equippable.setEquipment(mc.EquipmentSlot.Mainhand, emptyItem);
				return;
			}

			durability.damage++;
			equippable.setEquipment(mc.EquipmentSlot.Mainhand, itemStack);

			source.dimension.playSound(shootingSound, source.getHeadLocation());
			source.playAnimation("animation.dt_misc.player_gun_fire");
			source.runCommand("tp @s[tag=gun_recoil_on] ~~~ facing ^ ^0.03 ^1");

			if (!source.isOnGround) {
				source.runCommand("camerashake add @s 0.15 0.16 rotational");
				source.onScreenDisplay.setActionBar("§c-      §f+      §c-");
				shootProjectile(source, bulletTypeUncertain, 1.6);
			} else if (!source.isSneaking) {
				source.runCommand("camerashake add @s 0.05 0.12 rotational");
				source.onScreenDisplay.setActionBar("§c- §f+ §c-");
				shootProjectile(source, bulletTypeNormal, 1.6);
			} else {
				source.runCommand("camerashake add @s 0.04 0.11 rotational");
				source.onScreenDisplay.setActionBar("§c-§f+§c-");
				shootProjectile(source, bulletTypeSneak, 1.6);
			}
		},
	});

	e.itemComponentRegistry.registerCustomComponent(componentNameEmpty, {
		onUse({ source, itemStack }) {
			if (!itemStack) return;

			const equippable = source.getComponent("equippable");
			if (!equippable) return;

			const isCorrectItem =
				equippable.getEquipment(mc.EquipmentSlot.Mainhand)?.type === itemStack.type;
			if (!isCorrectItem) return;

			if (source.getItemCooldown(reloadingCooldownCategory) > 0) {
				source.onScreenDisplay.setActionBar({ translate: "dt.guide.still_reloading" });
				return;
			}

			const durability = itemStack.getComponent("durability")!;

			const shouldReplaceWithLoaded = durability.maxDurability - durability.damage <= 1;
			if (shouldReplaceWithLoaded) {
				source.dimension.playSound("scpdt.gun.reload_complete", source.getHeadLocation());
				const emptyItem = new mc.ItemStack(itemType);
				equippable.setEquipment(mc.EquipmentSlot.Mainhand, emptyItem);
				return;
			}

			const offhandItem = equippable.getEquipment(mc.EquipmentSlot.Offhand);
			if (!offhandItem || offhandItem.typeId !== magItemType) {
				source.onScreenDisplay.setActionBar({ translate: "dt.guide.equip_mag_on_offhand" });
				return;
			}

			equippable.setEquipment(mc.EquipmentSlot.Offhand, new mc.ItemStack(emptyMagItemType, 1));

			durability.damage++;
			equippable.setEquipment(mc.EquipmentSlot.Mainhand, itemStack);

			source.startItemCooldown(reloadingCooldownCategory, 1.86 * mc.TicksPerSecond);
			source.dimension.playSound(reloadingSound, source.getHeadLocation());
			source.playAnimation("animation.dt_misc.gun_reload_short");
			source.addEffect("slowness", 4 * mc.TicksPerSecond, { amplifier: 0, showParticles: false });
		},
	});
});
