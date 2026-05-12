import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: image().optional(),
		tags: z.array(z.enum([
			"Newsletter",
			"Philosophy",
			"Engineering",
			"Productivity",
			"Simulation",
			"Software",
			"ANSYS",
			"Running",
			"Health",
			"Creativity",
			"Nature",
			"Books",
			"Economics"
		])).optional(), 
	}),
});

const adventures = defineCollection({
	loader: glob({ base: './src/content/adventures', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		tripTitle: z.string(),
		tripSlug: z.string(),
		kind: z.enum(['trip', 'day']),
		year: z.number(),
		order: z.number(),
		date: z.coerce.date().optional(),
		sleepLocation: z.string().optional(),
		activitiesAm: z.string().optional(),
		activitiesPm: z.string().optional(),
		activitiesEvening: z.string().optional(),
		drivingTime: z.string().optional(),
		accommodation: z.string().optional(),
		heroImage: image().optional(),
		icon: z.string().optional(),
		sourceUrl: z.string().url().optional(),
	}),
});

export const collections = { blog, adventures };
