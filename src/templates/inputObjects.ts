import {
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  Kind,
} from "graphql";
import { codetpl, MAP } from "../lib/codetpl";
import { Context } from "../context";
import { typename } from "./utils";

export const declare_inputObject_type = (
  ctx: Context,
  e: InputObjectTypeDefinitionNode
) =>
  codetpl`
    export type ${e.name.value} = {
      ${MAP(e.fields, v => inputObject_field(ctx, v))}
    }

    `;

export const inputObject_field = (ctx: Context, v: InputValueDefinitionNode) =>
  codetpl`
    ${v.name.value}${conditional(ctx, v)}: ${typename(ctx, v.type)};
    `;

const conditional = (ctx: Context, v: InputValueDefinitionNode) =>
  v.type.kind === Kind.NON_NULL_TYPE ? "" : "?";
