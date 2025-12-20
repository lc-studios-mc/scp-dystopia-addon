import { weightedRandom } from "@mcbe-toolbox-lc/sukuriputils/math";
import * as mc from "@minecraft/server";

type SCP1025EffectChoice = {
	weight: number;
	effect: string;
	duration: number;
	amplifier: number;
};

const effectChoices: SCP1025EffectChoice[] = [
	{
		weight: 16,
		effect: "weakness",
		duration: 130 * mc.TicksPerSecond,
		amplifier: 1,
	},
	{
		weight: 14,
		effect: "slowness",
		duration: 140 * mc.TicksPerSecond,
		amplifier: 0,
	},
	{
		weight: 10,
		effect: "hunger",
		duration: 60 * mc.TicksPerSecond,
		amplifier: 1,
	},
	{
		weight: 13,
		effect: "mining_fatigue",
		duration: 120 * mc.TicksPerSecond,
		amplifier: 0,
	},
	{
		weight: 3,
		effect: "poison",
		duration: 43 * mc.TicksPerSecond,
		amplifier: 0,
	},
];

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:scp1025", {
		onUse({ source }) {
			const effect = weightedRandom(effectChoices);

			source.addEffect(effect.effect, effect.duration, {
				amplifier: effect.amplifier,
				showParticles: true,
			});

			source.dimension.playSound("scpdt.scp1025.read", source.getHeadLocation(), {
				volume: 1.2,
			});
		},
	});
});
