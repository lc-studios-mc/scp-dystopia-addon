import * as v from "@mcbe-toolbox-lc/vecarr";
import * as mc from "@minecraft/server";
import { vec3 } from "gl-matrix";

const shootBall = (source: mc.Player) => {
	const projectile = source.dimension.spawnEntity(
		"lc:dt_scp5167_cannon_ball",
		source.getHeadLocation(),
	);
	const projectileComp = projectile.getComponent("projectile")!;
	projectileComp.owner = source;
	const force = vec3.scale(vec3.create(), v.toArr3(source.getViewDirection()), 2.2);
	projectileComp.shoot(v.toObj3(force));
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:scp5167_cannon", {
		onUse({ source, itemStack }) {
			if (!itemStack) return;

			const equippable = source.getComponent("equippable");
			if (!equippable) return;

			source.dimension.playSound("mob.blaze.shoot", source.getHeadLocation(), { volume: 1.2 });
			source.playAnimation("animation.dt_misc.player_gun_fire");
			source.runCommand("tp @s[tag=gun_recoil_on] ~~~ facing ^ ^0.28 ^5");
			source.runCommand("camerashake add @s 0.44 0.2 rotational");
			source.onScreenDisplay.setActionBar("§c> SUS >  §e+  §c< SUS <");
			shootBall(source);
		},
	});
});
