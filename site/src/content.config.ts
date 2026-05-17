import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const teamMembers = defineCollection({
    loader: glob({ base: './src/content/team', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
        name: z.string(),
        role: z.string(),
        image: z.string(),
        linkedin: z.url(),
        order: z.number()
    }),
});

const projects = defineCollection({
    loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
        title: z.string(),
        progress: z.string(),
        expectedrelease: z.string(),
        images: z.array(z.object({
            url: z.string(),
            alt: z.string()
        }))
    }),
});

const logs = defineCollection({
    loader: glob({ base: './src/content/logs', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
        title: z.string(),
        written: z.date(),
        updated: z.date(),
        author: z.string()
    }),
});

export const collections = {
    teamMembers,
    projects,
    logs
};
