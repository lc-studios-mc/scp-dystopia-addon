import * as v from "@mcbe-toolbox-lc/vecarr";
import * as mc from "@minecraft/server";
import { vec3 } from "gl-matrix";

const shootRocket = (source: mc.Player) => {
	const projectile = source.dimension.spawnEntity("lc:dt_rpg_rocket", source.getHeadLocation());
	const projectileComp = projectile.getComponent("projectile")!;
	projectileComp.owner = source;
	const force = vec3.scale(vec3.create(), v.toArr3(source.getViewDirection()), 3);
	projectileComp.shoot(v.toObj3(force));
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:rocket_launcher", {
		onUse({ source, itemStack }) {
			if (!itemStack) return;

			const equippable = source.getComponent("equippable");
			if (!equippable) return;

			source.dimension.playSound("scpdt.rocket_launcher.shoot", source.getHeadLocation(), {
				volume: 2,
			});
			source.playAnimation("animation.dt_misc.player_gun_fire");
			source.runCommand("camerashake add @s 0.15 0.4 positional");
			shootRocket(source);

			const emptyItem = new mc.ItemStack("lc:dt_rocket_launcher_empty");
			equippable.setEquipment(mc.EquipmentSlot.Mainhand, emptyItem);
		},
	});

	e.itemComponentRegistry.registerCustomComponent("scpdt:rocket_launcher_empty", {
		onUse({ source, itemStack }) {
			if (!itemStack) return;

			const equippable = source.getComponent("equippable");
			if (!equippable) return;

			const isCorrectItem =
				equippable.getEquipment(mc.EquipmentSlot.Mainhand)?.type === itemStack.type;
			if (!isCorrectItem) return;

			if (source.getItemCooldown("dt_rpg_reload") > 0) {
				source.onScreenDisplay.setActionBar({ translate: "dt.guide.still_reloading" });
				return;
			}

			const durability = itemStack.getComponent("durability")!;

			const shouldReplaceWithLoaded = durability.maxDurability - durability.damage <= 1;
			if (shouldReplaceWithLoaded) {
				source.dimension.playSound("scpdt.gun.reload_complete", source.getHeadLocation());
				const emptyItem = new mc.ItemStack("lc:dt_rocket_launcher");
				equippable.setEquipment(mc.EquipmentSlot.Mainhand, emptyItem);
				return;
			}

			const offhandItem = equippable.getEquipment(mc.EquipmentSlot.Offhand);
			if (!offhandItem || offhandItem.typeId !== "lc:dt_rpg_rocket") {
				source.onScreenDisplay.setActionBar({ translate: "dt.guide.equip_ammo_on_offhand" });
				return;
			}

			equippable.setEquipment(mc.EquipmentSlot.Offhand, undefined);

			durability.damage++;
			equippable.setEquipment(mc.EquipmentSlot.Mainhand, itemStack);

			source.startItemCooldown("dt_rpg_reload", 2.82 * mc.TicksPerSecond);
			source.dimension.playSound("scpdt.rpg.reload", source.getHeadLocation());
			source.playAnimation("animation.dt_misc.gun_reload_medium");
			source.addEffect("slowness", 3 * mc.TicksPerSecond, { amplifier: 1, showParticles: false });
		},
	});
});
