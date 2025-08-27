import { Data, Effect, HashSet, Ref } from "effect";

const makeHashSetRef = <Args extends readonly unknown[]>() => {
  const getValue = Data.tuple<Args>;
  return Effect.map(
    Ref.make(HashSet.empty<Args>()),
    (ref) => ({
      /** @see {@linkcode HashSet.add} @returns `true` when value is added */
      add: (...args: Args) => ref.modify((set) => {
        const value = getValue(...args);
        return !HashSet.has(set, value)
          ? [true, HashSet.add(set, value)]
          : [false, set];
      }),

      /** @see {@linkcode HashSet.values} */
      values: Effect.map(ref.get, HashSet.values),
    }),
  );
};

export class Artists extends Effect.Service<Artists>()("@/state/artists", {
  accessors: true,
  effect: makeHashSetRef<[did: string]>(),
}) { };

export class Posts extends Effect.Service<Posts>()("@/state/posts", {
  accessors: true,
  effect: makeHashSetRef<[postId: number, postUri: string]>(),
}) { };
