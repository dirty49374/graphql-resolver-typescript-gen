import { GraphQLSchema } from "graphql";
import { Types, PluginFunction } from "@graphql-codegen/plugin-helpers";
import { createContext } from "./context";
import { resolver_codes, imports_codes } from "./templates/main";

export type KGraphQLGenConfig = {};

export const plugin: PluginFunction<
  KGraphQLGenConfig,
  Types.ComplexPluginOutput
> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: KGraphQLGenConfig
) => {
    const ctx = createContext(schema);

    const code = resolver_codes(ctx);
    const importCode = imports_codes(ctx);

    return {
      prepend: [importCode],
      content: code,
    }
  };
