export type TemplateFn<TC = any, TI = unknown> = (
  context: TC,
  input: TI
) => string;
export type TemplateFnMap<TK extends string, TC = any, TI = any> = Record<
  TK,
  TemplateFn<TC, TI>
>;

export function render<TC = any, TI = unknown>(
  template: TemplateFn<TC, TI>,
  context: TC,
  input: TI
): string;
export function render(template: any, context: any, input?: any): string {
  return template(context, input);
}

export const typeTemplateMap = <TC = any, TI = unknown>() => ({
  create: <TK extends string, T extends TemplateFnMap<TK, TC, TI>>(map: T): T =>
    map,
});

export const codetpl = (strArr: TemplateStringsArray, ...valArr: any[]) => {
  let handler = cached.get(strArr);
  if (!handler) {
    handler = strArr.every((s) => s.indexOf("\n") === -1)
      ? compileSingleLineTemplate(strArr)
      : compileMultipleLineTemplate(strArr);
    cached.set(strArr, handler);
  }
  return handler(valArr);
};

export const MAP = <T>(arr: readonly T[] | null | undefined, cb: (input: T) => string): string =>
  (arr || []).map((input) => cb(input)).join("\n");

export const capitalize = (str: string) =>
  str.length ? str[0].toUpperCase() + str.substring(1) : str;

export const snakeToCamel = str =>
  str.toLowerCase().replace(/([-_][a-z])/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );


export const snakeToPascal = str => str
  .split(/[-_]+/).map(s => capitalize(s.toLowerCase())).join('');


const cached = new Map<TemplateStringsArray, (values: any[]) => string>();

const last = <T>(list: readonly T[]): T | undefined => list[list.length - 1];

const compileSingleLineTemplate =
  (strings: TemplateStringsArray) => (values: any[]) => {
    let output = "";
    for (let i = 0; i < strings.length - 1; ++i) {
      output += strings[i];
      output += values[i];
    }
    output += strings[strings.length - 1];
    return output;
  };

const compileMultipleLineTemplate = (
  strArr: TemplateStringsArray
): ((values: any[]) => string) => {
  interface Fragment {
    type: string;
    text?: string;
    newline?: boolean;
  }

  const startCol = last(last(strArr.raw)!.split("\n"))!.length;
  const fragments: Fragment[] = [];

  for (let i = 0; i < strArr.length; ++i) {
    const lines = strArr[i].split(/\r?\n/);
    const items = lines.map((l, n) => ({
      type: n === 0 ? "" : l.substring(0, startCol).trim(),
      text: n === 0 ? l : l.substring(startCol),
      newline: n != 0,
    }));

    fragments.push(...items);
    if (i !== strArr.length - 1) fragments.push({ type: "input" });
  }
  fragments.shift();

  return (values: any[]) => {
    let i = 0;
    const lines = [];

    const state = {
      text: "",
      preserve: true,
    };

    const appendLine = () => {
      // console.log('?skip', state.preserve, state.text);
      if (!state.preserve && state.text.match(/^\s*$/)) {
        return;
      }
      lines.push(state.text);
      state.text = "";
    };

    for (const item of fragments) {
      if (item.type !== "input") {
        if (item.newline) {
          appendLine();
          state.preserve = item.type !== "-";
        }
        state.text += item.text;
      } else {
        const value = values[i++];
        const result = (
          value === null || value === undefined ? "" : `${value}`
        ).split(/\r?\n/);

        const indent = state.text.length;
        state.text += result[0];

        for (let j = 1; j < result.length; ++j) {
          appendLine();
          state.text = " ".repeat(indent) + result[j];
        }
      }
    }

    lines.shift();
    return lines.join("\n");
  };
};
