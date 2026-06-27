/// <reference path="../markdown.d.ts" />

export * as SkillPlugin from "./skill"

import { define } from "@devcode/plugin/v2/effect"
import { Effect } from "effect"
import { AbsolutePath } from "../schema"
import { SkillV2 } from "../skill"
import customizeDevcodeContent from "./skill/customize-devcode.md" with { type: "text" }

export const CustomizeDevcodeContent = customizeDevcodeContent

export const Plugin = define({
  id: "skill",
  effect: Effect.fn(function* (ctx) {
    yield* ctx.skill.transform((draft) => {
      draft.source(
        new SkillV2.EmbeddedSource({
          type: "embedded",
          skill: new SkillV2.Info({
            name: "customize-devcode",
            description:
              "Use ONLY when the user is editing or creating devcode's own configuration: devcode.json, devcode.jsonc, files under .devcode/, or files under ~/.config/devcode/. Also use when creating or fixing devcode agents, subagents, commands, skills, plugins, MCP servers, or permission rules. Do not use for the user's own application code, or for any project that is not configuring devcode itself.",
            location: AbsolutePath.make("/builtin/customize-devcode.md"),
            content: CustomizeDevcodeContent,
          }),
        }),
      )
    })
  }),
})
