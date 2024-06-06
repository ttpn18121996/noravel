declare namespace Express {
  export interface Request {
    getQuery?: (key: string | null = null, defaultValue: any = null) => Object;
    getInput?: (key: string | null = null, defaultValue: any = null) => Object;
    getPost?: (key: string | null = null, defaultValue: any = null) => Object;
    getParam?: (key: string | null = null, defaultValue: any = null) => Object;
  }

  export interface Response {
    view?: (
      view: string,
      options?: Object | undefined,
      callback?: ((err: Error, html: string) => void) | undefined,
    ) => void;

    abort?: (status: number, message: string) => void;
  }
}
