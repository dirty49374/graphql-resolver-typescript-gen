import { GraphQLScalarType } from "graphql";
import { codetpl, MAP } from "../lib/codetpl";
import { Context } from "../context";
import { scalar_type_name } from "./utils";

export const scalar_fields = (ctx: Context, e: GraphQLScalarType[]) =>
  codetpl`
    ${MAP(e, v => scalar_field(ctx, v))}
    `;

export const scalar_field = (ctx: Context, e: GraphQLScalarType) =>
  codetpl`
    ${e.name}: ${scalar_type_name(ctx, e.name)};
    `;

export const declare_scalar_type = (ctx: Context, scalars: GraphQLScalarType[]) =>
  codetpl`
    export type Scalars = {
      ${scalar_fields(ctx, scalars)}
    }

    `;
