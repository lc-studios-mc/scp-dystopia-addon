import * as v from "@mcbe-toolbox-lc/vecarr";
import * as mc from "@minecraft/server";
import { vec3 } from "gl-matrix";

const shootProjectile = (source: mc.Player, projectileType: string, launchPower: number) => {
	const projectile = source.dimension.spawnEntity(projectileType, source.getHeadLocation());
	const projectileComp = projectile.getComponent("projectile")!;
	projectileComp.owner = source;
	const force = vec3.scale(vec3.create(), v.toArr3(source.getViewDirection()), launchPower);
	projectileComp.shoot(v.toObj3(force));
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:dystopia_rifle", {
		onUse({ source, itemStack }) {
			if (!itemStack) return;

			const equippable = source.getComponent("equippable")!;
			const durability = itemStack.getComponent("durability")!;

			// Reload
			if (durability.damage !== 0) {
				const offhandSlot = equippable.getEquipmentSlot(mc.EquipmentSlot.Offhand);
				if (!offhandSlot.hasItem() || offhandSlot.typeId !== "lc:dt_dtrifle_ammo") {
					source.onScreenDisplay.setActionBar({ translate: "dt.guide.equip_ammo_on_offhand" });
					return;
				}

				durability.damage = 0;
				equippable.setEquipment(mc.EquipmentSlot.Mainhand, itemStack);
				offhandSlot.setItem(new mc.ItemStack("lc:dt_dtrifle_ammo_empty", 1));
				source.addEffect("slowness", 4 * mc.TicksPerSecond, { amplifier: 2, showParticles: false });
				source.dimension.playSound("scpdt.dtrifle.reload", source.getHeadLocation());

				return;
			}

			// Shoot

			durability.damage++;
			equippable.setEquipment(mc.EquipmentSlot.Mainhand, itemStack);

			source.addEffect("slowness", 1 * mc.TicksPerSecond, { amplifier: 2, showParticles: false });
			source.dimension.playSound("scpdt.dtrifle.shot", source.getHeadLocation(), { volume: 1.5 });
			source.runCommand("camerashake add @s 0.3 0.24 positional");
			source.runCommand("tp @s[tag=gun_recoil_on] ~~~ facing ^ ^0.28 ^5");
			source.onScreenDisplay.setActionBar("§b>>>> §c+ §b<<<<");

			if (source.isSneaking) {
				shootProjectile(source, "lc:dt_dtrifle_bullet_player_sneak", 5);
			} else {
				shootProjectile(source, "lc:dt_dtrifle_bullet_player", 4);
			}
		},
	});
});
