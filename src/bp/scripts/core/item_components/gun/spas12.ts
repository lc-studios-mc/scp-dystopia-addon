import * as v from "@mcbe-toolbox-lc/vecarr";
import * as mc from "@minecraft/server";
import { vec3 } from "gl-matrix";

const componentName = "scpdt:spas12";
const componentNameEmpty = "scpdt:spas12_empty";
const itemType = "lc:dt_spas12";
const emptyItemType = "lc:dt_spas12_empty";
const magItemType = "lc:dt_spas12_shellbox";
const bulletTypeUncertain = "lc:dt_spas12_bullet_player_uncertain";
const bulletTypeNormal = "lc:dt_spas12_bullet_player";
const bulletTypeSneak = "lc:dt_spas12_bullet_player_sneak";
const shootingSound = "scpdt.spas12.shot";
const reloadingCooldownCategory = "dt_spas12_reloading";
const reloadingSound = "scpdt.spas12.reload";

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

			source.dimension.playSound(shootingSound, source.getHeadLocation());
			source.playAnimation("animation.dt_misc.player_gun_fire");
			source.runCommand("tp @s[tag=gun_recoil_on] ~~~ facing ^ ^1 ^5");

			const remainingDurability = durability.maxDurability - durability.damage;

			if (!source.isOnGround) {
				source.runCommand("camerashake add @s 0.42 0.33 rotational");
				source.onScreenDisplay.setActionBar("§c(        §f+        §c)");
				shootProjectile(source, bulletTypeUncertain, 3);
				durability.damage++;
			} else if (!source.isSneaking || remainingDurability <= 2) {
				source.runCommand("camerashake add @s 0.42 0.33 rotational");
				source.onScreenDisplay.setActionBar("§c(   §f+   §c)");
				shootProjectile(source, bulletTypeNormal, 3);
				durability.damage++;
			} else {
				source.runCommand("camerashake add @s 0.8 0.3 rotational");
				source.onScreenDisplay.setActionBar("§c( (   §f+   §c) )");
				shootProjectile(source, bulletTypeSneak, 5);
				durability.damage += 2;
			}

			equippable.setEquipment(mc.EquipmentSlot.Mainhand, itemStack);
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

			equippable.setEquipment(mc.EquipmentSlot.Offhand, undefined);

			durability.damage++;
			equippable.setEquipment(mc.EquipmentSlot.Mainhand, itemStack);

			source.startItemCooldown(reloadingCooldownCategory, 6 * mc.TicksPerSecond);
			source.dimension.playSound(reloadingSound, source.getHeadLocation());
			source.playAnimation("animation.dt_misc.gun_reload_long");
			source.addEffect("slowness", 6 * mc.TicksPerSecond, { amplifier: 1, showParticles: false });
		},
	});
});
