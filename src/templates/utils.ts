import {
  GraphQLScalarType,
  Kind,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
  TypeNode,
} from "graphql";
import { Context } from "../context";

export const scalar_type_name = (ctx: Context, name: string) => {
  return (
    {
      ID: "string",
      Int: "number",
      String: "string",
      Timestamp: "Date",
    }[name] || "any"
  );
};

export const is_scalar = (ctx: Context, v: string) =>
  ctx.getType(v) instanceof GraphQLScalarType;

export const not_null_typename = (ctx: Context, v: TypeNode) => {
  switch (v.kind) {
    case Kind.NAMED_TYPE:
      return is_scalar(ctx, v.name.value)
        ? scalar_type_name(ctx, v.name.value)
        : `${v.name.value}`;

    case Kind.NON_NULL_TYPE:
      return `${not_null_typename(ctx, (v as NonNullTypeNode).type)}`;

    case Kind.LIST_TYPE:
      const elemTypeName = typename(ctx, v.type);
      if (elemTypeName.includes("|")) return `(${elemTypeName})[]`;
      return `${typename(ctx, v.type)}[]`;
  }
  throw new Error(`unknown TypeName kind = ${(v as any).kind}`);
};

export const typename = (ctx: Context, v: TypeNode) => {
  switch (v.kind) {
    case Kind.NAMED_TYPE:
      return is_scalar(ctx, v.name.value)
        ? `${scalar_type_name(ctx, v.name.value)} | null`
        : `${v.name.value} | null`;

    case Kind.LIST_TYPE:
      const elemTypeName = typename(ctx, v.type);
      if (elemTypeName.includes("|")) return `(${elemTypeName})[] | null`;
      return `${typename(ctx, v.type)}[] | null`;

    case Kind.NON_NULL_TYPE:
      return not_null_typename(ctx, v.type);
  }
  throw new Error(`unknown TypeName kind = ${(v as any).kind}`);
};

export const is_root_type = (ctx: Context, e: ObjectTypeDefinitionNode) =>
  ctx.root.query?.name === e.name.value ||
  ctx.root.mutation?.name === e.name.value ||
  ctx.root.subscription?.name === e.name.value;

export const is_subscription_type = (ctx: Context, e: ObjectTypeDefinitionNode) =>
  ctx.schema.getSubscriptionType()?.name === e.name.value;
