import * as mongoose from 'mongoose';
import { isNullOrUndefined } from './internal/utils';
import { logger } from './logSettings';
import type { DocumentType, Ref, RefType } from './types';

/**
 * Check if the given document is populated
 * @param doc The Ref with uncertain type
 */
export function isDocument<T, S extends RefType>(
  doc: Ref<T, S>
  // handle type case of T being "DocumentType" already and being a OR of other types (like for count hooks)
  // i am not a typescript wizard, so i dont know how to handle this better, this will need to be updated for #730 and #587
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore somehow the following errors in typescript 4.9, but can be disabled with a directive
): doc is T extends DocumentType<infer T1, infer T2> ? DocumentType<T1, T2> : T extends object ? DocumentType<T> : never {
  return doc instanceof mongoose.Model;
}

/**
 * Check if the given array is fully populated
 * Only returns "true" if all members in the array are populated
 * @param docs The Array of Refs with uncertain type
 */
export function isDocumentArray<T, S extends RefType>(
  docs: mongoose.Types.Array<Ref<T, S>> | undefined
): docs is mongoose.Types.Array<DocumentType<NonNullable<T>>>;
/**
 * Check if the given array is fully populated
 * Only returns "true" if all members in the array are populated
 * @param docs The Array of Refs with uncertain type
 */
export function isDocumentArray<T, S extends RefType>(docs: Ref<T, S>[] | undefined): docs is DocumentType<NonNullable<T>>[];
export function isDocumentArray(docs: Ref<any, any>[] | undefined): unknown {
  // its "any" & "unknown" because this is not listed as an overload
  return Array.isArray(docs) && docs.every((v) => isDocument(v));
}

type AllowedRefTypes = typeof String | typeof Number | typeof Buffer | typeof mongoose.Types.ObjectId | typeof mongoose.Types.Buffer;

/**
 * Check if the document is of type "refType"
 * @param doc The Ref with uncretain type
 * @param refType The Expected Reference Type (this is required because this type is only known at compile time, not at runtime)
 */
export function isRefType<T, S extends RefType>(doc: Ref<T, S> | undefined, refType: AllowedRefTypes): doc is NonNullable<S> {
  logger.info('isRefType:', refType);

  if (isNullOrUndefined(doc) || isDocument(doc)) {
    return false;
  }

  // this "ObjectId" test is in the front, because its the most common - to lower resource use
  if (refType === mongoose.Types.ObjectId) {
    return doc instanceof mongoose.Types.ObjectId;
  }
  if (refType === String) {
    return typeof doc === 'string';
  }
  if (refType === Number) {
    return typeof doc === 'number';
  }
  if (refType === Buffer || refType === mongoose.Types.Buffer) {
    return doc instanceof Buffer;
  }

  return false;
}

/**
 * Check if the array is fully of type "refType"
 * Only returns "true" if all members in the array are of type "refType"
 * @param docs The Ref with uncretain type
 * @param refType The Expected Reference Type (this is required because this type is only known at compile time, not at runtime)
 */
export function isRefTypeArray<T, S extends RefType>(
  docs: mongoose.Types.Array<Ref<T, S>> | undefined,
  refType: AllowedRefTypes
): docs is mongoose.Types.Array<NonNullable<S>>;
/**
 * Check if the array is fully of type "refType"
 * Only returns "true" if all members in the array are of type "refType"
 * @param docs The Ref with uncretain type
 * @param refType The Expected Reference Type (this is required because this type is only known at compile time, not at runtime)
 */
export function isRefTypeArray<T, S extends RefType>(docs: Ref<T, S>[] | undefined, refType: AllowedRefTypes): docs is NonNullable<S>[];
export function isRefTypeArray(docs: Ref<any, any>[] | undefined, refType: AllowedRefTypes): unknown {
  // its "any" & "unknown" because this is not listed as an overload
  return Array.isArray(docs) && docs.every((v) => isRefType(v, refType));
}

/**
 * Check if the input is a mongoose.Model
 * @param model The Value to check
 */
export function isModel(model: any): model is mongoose.Model<any> {
  return model?.prototype instanceof mongoose.Model;
}
