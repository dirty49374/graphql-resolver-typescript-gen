# graphql-resolver-typescript-gen

supports custom @ownResolver directive

```typescript
type Directory {
  id: ID!
  files: [File!] @ownResolver
}

// will generate below

export interface Directory  {
  __typename?: 'Directory';
  id: string;
}

export type DirectoryResolver<TContext = any> = {
  files: (parent: Directory, args: {}, context: TContext, info: GraphQLResolveInfo) => Promise<File[] | null> | File[] | null;

  __isTypeOf?: (obj: Directory, context: TContext, info: GraphQLResolveInfo) => Promise<boolean> | boolean;
};

```

