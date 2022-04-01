import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType,
  OperationTypeNode,
} from "graphql";

export type Context = ReturnType<typeof createContext>;

export const createContext = (schema: GraphQLSchema) => {
  const typeMap = schema.getTypeMap();

  const types = Object.getOwnPropertyNames(typeMap)
    .filter((name) => !name.startsWith("__"))
    .map((name) => typeMap[name]);

  const enums = types.filter((type) => type instanceof GraphQLEnumType) as GraphQLEnumType[];
  const interfaces = types.filter((type) => type instanceof GraphQLInterfaceType) as GraphQLInterfaceType[];
  const inputObjects = types.filter((type) => type instanceof GraphQLInputObjectType) as GraphQLInputObjectType[];
  const unions = types.filter((type) => type instanceof GraphQLUnionType) as GraphQLUnionType[];
  const objects = types.filter((type) => type instanceof GraphQLObjectType) as GraphQLObjectType[];
  const scalars = types.filter((type) => type instanceof GraphQLScalarType) as GraphQLScalarType[];

  return {
    typeMap,
    types,
    enums,
    enumNodes: enums.map((v) => v.astNode),
    interfaces,
    interfaceNodes: interfaces.map((v) => v.astNode),
    inputObjects,
    inputObjectNodes: inputObjects.map((v) => v.astNode),
    unions,
    unionNodes: unions.map((v) => v.astNode),
    scalars,
    scalarNodes: scalars.map((v) => v.astNode),
    objects,
    objectNodes: objects.map((v) => v.astNode),
    schema,
    getType: (v) => schema.getType(v),
    root: {
      query: schema.getRootType(OperationTypeNode.QUERY),
      mutation: schema.getRootType(OperationTypeNode.MUTATION),
      subscription: schema.getRootType(OperationTypeNode.SUBSCRIPTION),
    },
  };
};
