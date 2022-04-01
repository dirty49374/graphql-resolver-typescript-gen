import { NamedTypeNode, UnionTypeDefinitionNode } from "graphql";
import { codetpl, MAP } from "../lib/codetpl";
import { Context } from "../context";

export const declare_union_type = (ctx: Context, e: UnionTypeDefinitionNode) =>
  codetpl`
  export type ${e.name.value} =
    ${MAP(e.types, v => declare_union_field(ctx, v))}
    ;

  `;

export const declare_union_field = (ctx: Context, e: NamedTypeNode) =>
  codetpl`
    | ${e.name.value}
    `;

