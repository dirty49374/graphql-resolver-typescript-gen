import {
  ConstDirectiveNode,
  FieldDefinitionNode,
  Kind,
  ObjectTypeDefinitionNode,
} from "graphql";
import { codetpl, MAP } from "../lib/codetpl";
import { Context } from "../context";
import { typename, is_root_type } from "./utils";

export const declare_object_type = (ctx: Context, e: ObjectTypeDefinitionNode) => {
  const has_directive = (directives: readonly ConstDirectiveNode[], name: string) =>
    (!directives ? false : !!directives.find((d) => d.name.value === name));

  const targetFields =
    e.fields.filter(
      (f) => is_root_type(ctx, e) || !has_directive(f.directives, "ownResolver")
    );
  return codetpl`
    export interface ${e.name.value} ${object_type_interfaces(ctx, e)} {
      __typename?: '${e.name.value}';
      ${MAP(targetFields, v => object_field(ctx, v))}
    }

    `;
}

export const object_type_interfaces = (ctx: Context, v: ObjectTypeDefinitionNode) => {
  const interfaces = (v.interfaces || []).filter(i => i.name.value !== 'Node');
  return interfaces.length
    ? `implements ${interfaces.map((i) => `${i.name.value}`).join(", ")}`
    : "";
}

export const object_field = (ctx: Context, v: FieldDefinitionNode) =>
  codetpl`
    ${v.name.value}${conditional(ctx, v)}: ${typename(ctx, v.type)};
    `;

const conditional = (ctx: Context, v: FieldDefinitionNode) =>
  v.type.kind === Kind.NON_NULL_TYPE ? "" : "?";

export const declare_subscription_object_type = (ctx: Context, e: ObjectTypeDefinitionNode) =>
  codetpl`
    export type ${e.name.value}<TContext = any> = {
      ${MAP(e.fields, v => subscription_object_field(ctx, v))}
    }
    `;

export const subscription_object_field = (ctx: Context, v: FieldDefinitionNode) => {

  const params = () => `parent: any, args: any, context: TContext, info: GraphQLResolveInfo`;

  return codetpl`
    ${v.name.value}: {
      subscribe: (${params()}) => AsyncIterable<${typename(ctx, v.type)}> | Promise<AsyncIterable<${typename(ctx, v.type)}>>,
      resolve: (${params()}) => ${typename(ctx, v.type)},
    },
    `;
}
