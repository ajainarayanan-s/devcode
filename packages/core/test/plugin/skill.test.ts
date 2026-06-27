import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { AgentV2 } from "@devcode/core/agent"
import { FSUtil } from "@devcode/core/fs-util"
import { SkillPlugin } from "@devcode/core/plugin/skill"
import { SkillV2 } from "@devcode/core/skill"
import { SkillDiscovery } from "@devcode/core/skill/discovery"
import { testEffect } from "../lib/effect"
import { host } from "./host"

const it = testEffect(
  SkillV2.layer.pipe(
    Layer.provide(FSUtil.defaultLayer),
    Layer.provide(SkillDiscovery.defaultLayer),
    Layer.provideMerge(AgentV2.locationLayer),
  ),
)

describe("SkillPlugin.Plugin", () => {
  it.effect("registers the built-in customize-devcode skill", () =>
    Effect.gen(function* () {
      const skill = yield* SkillV2.Service
      yield* SkillPlugin.Plugin.effect(host({ skill }))

      expect(yield* skill.list()).toContainEqual(
        expect.objectContaining({
          name: "customize-devcode",
          description: expect.stringContaining("devcode's own configuration"),
        }),
      )
    }),
  )
})
