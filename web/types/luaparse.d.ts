declare module 'luaparse' {
  export interface ParseOptions {
    wait?: boolean;
    comments?: boolean;
    scope?: boolean;
    locations?: boolean;
    ranges?: boolean;
    luaVersion?: '5.1' | '5.2' | '5.3';
  }

  export function parse(code: string, options?: ParseOptions): any;
}
