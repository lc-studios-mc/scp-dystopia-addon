import * as mc from "@minecraft/server";
import { vec3 } from "gl-matrix";
import * as vecarr from "@mcbe-toolbox-lc/vecarr";

const itemType = "lc:dt_ak";
const emptyItemType = "lc:dt_ak_empty";
const magItemType = "lc:dt_ak_mag";
const reloadingCooldownCategory = "dt_ak_reloading";
const reloadingSound = "scpdt.ak.reload";

const shootProjectile = (source: mc.Player, projectileType: string) => {
	const projectile = source.dimension.spawnEntity(projectileType, source.getHeadLocation());
	const projectileComp = projectile.getComponent("projectile")!;
	projectileComp.owner = source;
	const force = vec3.scale(vec3.create(), vecarr.toArr3(source.getViewDirection()), 3);
	projectileComp.shoot(vecarr.toObj3(force));
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:ak", {
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

			source.dimension.playSound("scpdt.ak.shot", source.getHeadLocation());
			source.playAnimation("animation.dt_misc.player_gun_fire");
			source.runCommand("tp @s[tag=gun_recoil_on] ~~~ facing ^ ^0.03 ^1");

			if (!source.isOnGround) {
				source.runCommand("camerashake add @s 0.2 0.23 rotational");
				source.onScreenDisplay.setActionBar("§c-          §f+          §c-");
				shootProjectile(source, "lc:dt_ak_bullet_player_uncertain");
			} else if (!source.isSneaking) {
				source.runCommand("camerashake add @s 0.09 0.1 rotational");
				source.onScreenDisplay.setActionBar("§c-  §f+  §c-");
				shootProjectile(source, "lc:dt_ak_bullet_player");
			} else {
				source.runCommand("camerashake add @s 0.05 0.1 rotational");
				source.onScreenDisplay.setActionBar("§c-§f+§c-");
				shootProjectile(source, "lc:dt_ak_bullet_player_sneak");
			}
		},
	});

	e.itemComponentRegistry.registerCustomComponent("scpdt:ak_empty", {
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

			source.startItemCooldown(reloadingCooldownCategory, 4 * mc.TicksPerSecond);
			source.dimension.playSound(reloadingSound, source.getHeadLocation());
			source.playAnimation("animation.dt_misc.gun_reload_short");
			source.addEffect("slowness", 4 * mc.TicksPerSecond, { amplifier: 0, showParticles: false });
		},
	});
});
