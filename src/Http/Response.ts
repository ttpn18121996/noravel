import { Response as ExpressResponse } from 'express-serve-static-core';

export interface Response extends ExpressResponse {
  view: (
    view: string,
    options?: Object | undefined,
    callback?: ((err: Error, html: string) => void) | undefined,
  ) => void;
}
