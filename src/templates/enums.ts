import { EnumTypeDefinitionNode, EnumValueDefinitionNode } from "graphql";
import { codetpl, MAP, snakeToPascal } from "../lib/codetpl";
import { Context } from "../context";

export const declare_enum_type = (ctx: Context, e: EnumTypeDefinitionNode) =>
  codetpl`
    export enum ${enum_name(ctx, e)} {
      ${MAP(e.values, v => enum_value(ctx, v))}
    };

    `;

export const enum_name = (ctx: Context, e: EnumTypeDefinitionNode) =>
  e.name.value;

export const enum_value = (ctx: Context, e: EnumValueDefinitionNode) =>
  codetpl`
    ${snakeToPascal(e.name.value)} = '${e.name.value}',
    `;

export const enum_value_comment = (ctx: Context, e: EnumValueDefinitionNode) =>
  e.description?.value ?? "";
