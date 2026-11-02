import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

// Reuses vite.config.ts so tests get the SvelteKit plugin (for $app/* modules and #lib).
export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
			// Playwright runs these (bun run test:acceptance)
			exclude: [...configDefaults.exclude, 'tests/acceptance/**'],
			environment: 'node',
			// Fail tests that never reach an expect(), e.g. when an await is forgotten
			expect: { requireAssertions: true }
		}
	})
);
