import {
  FieldDefinitionNode,
  InterfaceTypeDefinitionNode,
  Kind
} from "graphql";
import { Context } from "../context";
import { codetpl, MAP } from "../lib/codetpl";
import { typename } from "./utils";

export const declare_interface_type = (ctx: Context, e: InterfaceTypeDefinitionNode) =>
  codetpl`
    export type ${e.name.value} = ${interface_type_interfaces(ctx, e)} {
      __typename?: '${e.name.value}';
      ${MAP(e.fields, v => interface_field(ctx, v))}
    }

    `;

export const interface_type_interfaces = (ctx: Context, v: InterfaceTypeDefinitionNode) =>
  v.interfaces ? v.interfaces.map((i) => `${i.name.value} & `).join("") : "";

export const interface_field = (ctx: Context, v: FieldDefinitionNode) =>
  codetpl`
    ${v.name.value}${conditional(ctx, v)}: ${typename(ctx, v.type)};
    `;

const conditional = (ctx: Context, v: FieldDefinitionNode) =>
  v.type.kind === Kind.NON_NULL_TYPE ? "" : "?";
