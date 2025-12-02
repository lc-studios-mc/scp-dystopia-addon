import * as v from "@mcbe-toolbox-lc/vecarr";
import * as mc from "@minecraft/server";
import { vec3 } from "gl-matrix";

const componentName = "scpdt:suscharger";
const componentNameEmpty = "scpdt:suscharger_empty";
const itemType = "lc:dt_suscharger";
const emptyItemType = "lc:dt_suscharger_empty";
const magItemType = "lc:dt_suscharger_battery";
const emptyMagItemType = "lc:dt_suscharger_battery_empty";
const bulletTypeNormal = "lc:dt_suscharger_shot_player";
const bulletTypeSneak = "lc:dt_suscharger_shot_player_sneak";
const reloadingCooldownCategory = "suscharger_reload";
const reloadingSound = "scpdt.suscharger.reload";

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

			source.dimension.playSound("scpdt.scp5167_dragon.shot", source.getHeadLocation());
			source.playAnimation("animation.dt_misc.player_gun_fire");
			source.runCommand("tp @s[tag=gun_recoil_on] ~~~ facing ^ ^0.04 ^1");

			if (source.isSneaking) {
				source.dimension.playSound("mob.blaze.shoot", source.getHeadLocation());
				source.runCommand("camerashake add @s 1 0.36 rotational");
				source.onScreenDisplay.setActionBar("§c( §e[ + ] §c)");
				shootProjectile(source, bulletTypeSneak, 3);
			} else {
				source.dimension.playSound("scpdt.hig.shoot", source.getHeadLocation());
				source.runCommand("camerashake add @s 1 0.36 rotational");
				source.onScreenDisplay.setActionBar("§c>> §e[ + ] §c<<");
				shootProjectile(source, bulletTypeNormal, 9);
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

			source.startItemCooldown(reloadingCooldownCategory, 12 * mc.TicksPerSecond);
			source.dimension.playSound(reloadingSound, source.getHeadLocation());
			source.playAnimation("animation.dt_misc.gun_reload_long");
			source.addEffect("slowness", 12 * mc.TicksPerSecond, { amplifier: 0, showParticles: false });
		},
	});
});
