import * as mc from "@minecraft/server";

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:scp096_picture", {
		onUse({ source }) {
			const pictureProjectile = source.dimension.spawnEntity(
				"lc:dt_scp096_picture_t",
				source.getHeadLocation(),
			);
			const projectileComp = pictureProjectile.getComponent("projectile")!;

			projectileComp.owner = source;
			projectileComp.shoot({ x: 0, y: 0, z: 0 });

			source.onScreenDisplay.setActionBar("§cYou can't undone this. It will come.");
		},
	});
});

mc.world.afterEvents.projectileHitEntity.subscribe((e) => {
	if (e.projectile.typeId !== "lc:dt_scp096_picture_t") return;

	const hitEntity = e.getEntityHit().entity;
	if (!hitEntity || !hitEntity.matches({ families: ["scp096"] })) return;

	hitEntity.applyDamage(1, {
		cause: mc.EntityDamageCause.override,
		damagingEntity: e.source,
	});
});
