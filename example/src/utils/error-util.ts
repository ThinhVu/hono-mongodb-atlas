import type {Context} from "hono";
import {HTTPException} from "hono/http-exception";

export class ApiError extends Error {
   errorCode: string
   message: string
   __API_ERROR__: boolean

   constructor(errorCode: string, message?: string) {
      super(errorCode)
      this.__API_ERROR__ = true
      this.errorCode = errorCode
      // @ts-ignore
      this.message = message
   }
}

export function handleApiError(e: ApiError | Error | string | unknown, c: Context) {
   // TODO: Correctly handle errors
   // for some reason, the error is not an instance of ApiError
   console.log('handleApiError', e)
   console.error(e)
   // @ts-ignore
   if (e.__API_ERROR__) {
      // @ts-ignore
      throw new HTTPException(400, {error: e.errorCode, message: e.message})
   } else {
      // @ts-ignore
      throw new HTTPException(500, {error: "E_000", reason: typeof (e) === 'string' ? e : e.message})
   }
}
