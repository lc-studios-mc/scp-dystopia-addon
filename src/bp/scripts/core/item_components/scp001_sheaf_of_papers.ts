import * as mc from "@minecraft/server";

// Define the full list of weighted events
const weightedEvents = [
	// Summoning Events (Weight 5)
	{ weight: 5, commands: ["summon lc:dt_scp096"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp049"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp939"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp087_1"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp007"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp035_scientist"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp058"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp106"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp173"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp131"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp191"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp098"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp4959"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp5167"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp457"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp577"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp5535"], type: "summon" },
	{ weight: 5, commands: ["summon lc:dt_scp734"], type: "summon" },

	// Summoning Event (Weight 4)
	{ weight: 4, commands: ["summon lc:dt_scp682"], type: "summon" },

	// SCP-1025 Effect Randomization (Weight 4)
	{
		weight: 4,
		type: "scp_1025_effects",
		effects: [
			{ weight: 16, effect: "weakness", duration: 130, amplifier: 1 },
			{ weight: 14, effect: "slowness", duration: 140, amplifier: 0 },
			{ weight: 10, effect: "hunger", duration: 60, amplifier: 1 },
			{ weight: 13, effect: "mining_fatigue", duration: 120, amplifier: 0 },
			{ weight: 3, effect: "poison", duration: 43, amplifier: 0 },
			{ weight: 2, effect: "wither", duration: 16, amplifier: 0 },
		],
	},
];

const selectRandomWeighted = (options: any) => {
	if (!options || options.length === 0) return null;

	// Calculate the total weight
	const totalWeight = options.reduce((sum: number, option: any) => sum + option.weight, 0);

	// Pick a random number between 0 (inclusive) and totalWeight (exclusive)
	let randomNum = Math.random() * totalWeight;

	// Determine which option was selected
	for (const option of options) {
		if (randomNum < option.weight) {
			return option;
		}
		randomNum -= option.weight;
	}

	// Should not happen if weights are positive, but as a fallback:
	return options[options.length - 1];
};

mc.system.beforeEvents.startup.subscribe((e) => {
	e.itemComponentRegistry.registerCustomComponent("scpdt:scp001_sheaf_of_papers", {
		onUse({ source }) {
			const selectedMainEvent = selectRandomWeighted(weightedEvents);
			if (!selectedMainEvent) return;

			// --- Summoning Logic (type: 'summon') ---
			if (selectedMainEvent.type === "summon") {
				// Execute the command(s) on behalf of the player
				for (const command of selectedMainEvent.commands) {
					try {
						source.runCommand(command);
					} catch (error) {
						console.error(`Failed to run command ${command}: ${error}`);
					}
				}
			}

			// --- SCP-1025 Effects Logic (type: 'scp_1025_effects') ---
			else if (selectedMainEvent.type === "scp_1025_effects") {
				// Run the nested randomization for effects
				const selectedEffectEvent = selectRandomWeighted(selectedMainEvent.effects);

				if (selectedEffectEvent) {
					const { effect, duration, amplifier } = selectedEffectEvent;

					// Apply the effect
					source.addEffect(effect, duration * 20, { amplifier: amplifier, showParticles: true }); // duration is in ticks (20 ticks per second)

					// Execute the common commands for SCP-1025 effects
					// Note: Scripting API does not have a direct way to target @a[r=10]
					// We'll use a player-targeted command and a global sound command if the player is at the center.

					// Play sound at player's location for nearby players (Approximation of @a[r=10])
					source.runCommand(
						`playsound scpdt.scp1025.read @a[r=10] ${Math.floor(source.location.x)} ${Math.floor(source.location.y)} ${Math.floor(source.location.z)}`,
					);

					// Display title/actionbar message to the player
					// The JSON uses 'title @s actionbar ...', which we approximate with a message.
					source.onScreenDisplay.setActionBar(`You got SCP-1025 effect`);
					// In modern script, using runCommandAsync for title is often the simplest way:
					// source.runCommandAsync('title @s actionbar You got SCP-1025 effect');
				}
			}
		},
	});
});
