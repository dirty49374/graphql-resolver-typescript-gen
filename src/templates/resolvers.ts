import {
  ConstDirectiveNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  Kind,
  ObjectTypeDefinitionNode,
  OperationTypeNode,
} from "graphql";
import { capitalize, codetpl, MAP } from "../lib/codetpl";
import { typename, is_subscription_type, is_root_type } from "./utils";
import { Context } from "../context";

export const declare_resolver_type = (ctx: Context, e: ObjectTypeDefinitionNode) => {
  if (is_subscription_type(ctx, e))
    return declare_subscription_resolver_type(ctx, e);

  const has_directive = (directives: readonly ConstDirectiveNode[], name: string) =>
    (!directives ? false : !!directives.find((d) => d.name.value === name));

  const targetFields =
    e.fields.filter(
      (f) => is_root_type(ctx, e) || has_directive(f.directives, "ownResolver")
    );

  return codetpl`
    ${MAP(targetFields, v => declare_field_args_type(ctx, v, e))}

    export type ${e.name.value}Resolver<TContext = any> = {
      ${MAP(targetFields, v => field_resolver(ctx, v, e))}

      __isTypeOf?: (obj: ${e.name.value}, context: TContext, info: GraphQLResolveInfo) => Promise<boolean> | boolean;
    };

    `;
};


export const declare_field_args_type = (ctx: Context, f: FieldDefinitionNode, e: ObjectTypeDefinitionNode) => {
  if (!f.arguments?.length) return '';

  const arg = (ctx: Context, arg: InputValueDefinitionNode) =>
    `${arg.name.value}${conditional(arg)}: ${typename(ctx, arg.type)}`;

  const conditional = (arg: InputValueDefinitionNode) =>
    arg.type.kind === Kind.NON_NULL_TYPE ? '' : '?';

  return codetpl`
    export type ${capitalize(e.name.value)}${capitalize(f.name.value)}Args = {
      ${MAP(f.arguments, v => arg(ctx, v))};
    };
    `;
};

const parameters = (ctx: Context, parentType: string, f: FieldDefinitionNode, e: ObjectTypeDefinitionNode) => {
  const parent = () =>
    codetpl`parent: ${parentType}`;

  const args = () =>
    f.arguments?.length
      ? codetpl`args: ${capitalize(e.name.value)}${capitalize(f.name.value)}Args`
      : codetpl`args: {}`;

  const context = () =>
    codetpl`context: TContext`;

  const info = () =>
    codetpl`info: GraphQLResolveInfo`;

  return codetpl`${parent()}, ${args()}, ${context()}, ${info()}`;
}

export const field_resolver = (ctx: Context, f: FieldDefinitionNode, e: ObjectTypeDefinitionNode) => {
  const returnType = () =>
    codetpl`Promise<${typename(ctx, f.type)}> | ${typename(ctx, f.type)}`;

  return codetpl`
    ${f.name.value}: (${parameters(ctx, e.name.value, f, e)}) => ${returnType()};
    `;
}

export const declare_subscription_resolver_type = (ctx: Context, e: ObjectTypeDefinitionNode) => {

  return codetpl`
    ${MAP(e.fields, v => declare_field_args_type(ctx, v, e))}

    export type ${e.name.value}Resolver<TContext = any> = {
      ${MAP(e.fields, v => subscription_field_resolver(ctx, v, e))}

      __isTypeOf?: (obj: ${e.name.value}, context: TContext, info: GraphQLResolveInfo) => Promise<boolean> | boolean;
    };

    `;
};

export const subscription_field_resolver = (ctx: Context, f: FieldDefinitionNode, e: ObjectTypeDefinitionNode) => {
  const asyncIteratableType = () =>
    `AsyncIterable<${typename(ctx, f.type)}> | Promise<AsyncIterable<${typename(ctx, f.type)}>>`;

  return codetpl`
    ${f.name.value}: {
      subscribe: (${parameters(ctx, "any", f, e)}) => ${asyncIteratableType()},
      resolve: (${parameters(ctx, typename(ctx, f.type), f, e)}) => ${typename(ctx, f.type)},
    },
    `;
}


export const declare_all_resolvers_type = (ctx: Context) => {
  const has_directive = (e: ObjectTypeDefinitionNode, name: string) =>
    !e.fields.every(f => !f.directives?.find(d => d.name.value === name));

  const field = (e: ObjectTypeDefinitionNode) =>
    `${e.name.value}${conditional(e)}: ${e.name.value}Resolver<TContext>;`

  const conditional = (e: ObjectTypeDefinitionNode) =>
    is_root_type(ctx, e) || has_directive(e, "ownResolver") ? '' : '?';

  return codetpl`
    export type Resolvers<TContext = any> = {
      ${MAP(ctx.objectNodes, v => field(v))}
    };

    `;
};