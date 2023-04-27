import * as z from 'zod'
import { DateSchema } from './decoders'

const Environment = z.union([
  z.literal('development'),
  z.literal('qa'),
  z.literal('staging'),
  z.literal('production'),
])

const Release = z.object({
  tag: z.string().min(1),
  changelog: z.string().optional(),
})

const SuccessfulDeployment = z.object({
  type: z.literal('SuccessfulDeployment'),
  author: z.string().min(1),
  createdAt: DateSchema,
  environment: Environment,
  group: z.string().min(1),
  subgroup: z.string().min(1),
  release: Release,
  links: z.object({
    sourceCode: z.string().url(),
  }),
})

const FailedDockerImage = z.object({
  type: z.literal('FailedDockerImage'),
  group: z.string().min(1),
  links: z.object({
    sourceCode: z.string().url(),
    pipeline: z.string().url(),
    registry: z.string().url(),
    image: z.string().min(1),
  }),
})

const NewDockerImage = z.object({
  type: z.literal('NewDockerImage'),
  author: z.string().min(1),
  group: z.string().min(1),
  release: Release,
  links: z.object({
    sourceCode: z.string().url(),
    image: z.string().min(1),
  }),
})

const NewDesignFile = z.object({
  type: z.literal('NewDesignFile'),
  author: z.string().min(1),
  createdAt: DateSchema,
  group: z.string().min(1),
  subgroup: z.string().min(1),
  release: Release,
  differences: z.object({
    added: z.number().min(0),
    removed: z.number().min(0),
    changed: z.number().min(0),
  }),
  links: z.object({
    figma: z.string().url(),
    azureWorkItem: z.string().url(),
    report: z.string().url(),
  }),
})

const NewNpmPackageVersion = z.object({
  type: z.literal('NewNpmPackageVersion'),
  author: z.string().min(1),
  group: z.string().min(1),
  release: Release,
  links: z.object({
    sourceCode: z.string().url(),
    registry: z.string().url(),
  }),
})

const FailedNpmPackageVersion = z.object({
  type: z.literal('FailedNpmPackageVersion'),
  group: z.string().min(1),
  release: Release,
  links: z.object({
    sourceCode: z.string().url(),
    pipeline: z.string().url(),
    registry: z.string().url(),
  }),
})

export const Notification = z.union([
  SuccessfulDeployment,
  FailedDockerImage,
  FailedNpmPackageVersion,
  NewDockerImage,
  NewDesignFile,
  NewNpmPackageVersion,
])

export type FailedDockerImage = z.TypeOf<typeof FailedDockerImage>
export type FailedNpmPackageVersion = z.TypeOf<typeof FailedNpmPackageVersion>
export type Notification = z.TypeOf<typeof Notification>
export type NewDesignFile = z.TypeOf<typeof NewDesignFile>
export type NewDockerImage = z.TypeOf<typeof NewDockerImage>
export type NewNpmPackageVersion = z.TypeOf<typeof NewNpmPackageVersion>
export type Release = z.TypeOf<typeof Release>
export type SuccessfulDeployment = z.TypeOf<typeof SuccessfulDeployment>
