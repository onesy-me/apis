import express from 'express';

import { getObjectProperties, merge, parse, equalDeep, stringify } from '@amaui/utils';
import is, { TIsType, IOptions as IIsOptions } from '@amaui/utils/is';
import isValid, { TIsValidType, IOptions as IIsValidOptions } from '@amaui/utils/isValid';
import { ValidationError } from '@amaui/errors';

export interface IValidateOptions {
  message?: string;
  uriDecode?: boolean;
  parse?: boolean;
}

export type IValidateObject = 'body' | 'params' | 'query' | 'headers' | 'cookies';

export interface IValidateModelValueIs {
  type?: TIsType;
  options?: IIsOptions;
}

export interface IValidateModelValueIsValid {
  type?: TIsValidType;
  options?: IIsValidOptions;
}

export interface IValidateModelValueMethodOptions {
  request: express.Request,
  object: Record<string, any>,
  property: string,
  path: string,
  options: IValidateModelValue
}

export type IValidateModelValueMethod = (value: any, options: IValidateModelValueMethodOptions) => Promise<any> | any;

export interface IValidateModelValue {
  name?: string;

  message?: string;

  // validation
  required?: boolean;

  // is
  is?: TIsType | TIsType[] | IValidateModelValueIs | IValidateModelValueIs[];
  isValid?: TIsValidType | TIsValidType[] | IValidateModelValueIsValid | IValidateModelValueIsValid[];

  // of
  // ie. array of strings
  of?: TIsType | TIsType[] | IValidateModelValueIs | IValidateModelValueIs[];
  ofValid?: TIsValidType | TIsValidType[] | IValidateModelValueIsValid | IValidateModelValueIsValid[];

  // equal
  equal?: any;
  notEqual?: any;

  equalDeep?: any;
  notEqualDeep?: any;

  // some
  some?: any[];

  // in, every
  in?: any[];
  every?: any[];

  // properties
  properties?: string[];
  notProperties?: string[];

  // length
  min?: number;
  max?: number;
  // exact
  length?: number;

  // method
  method?: IValidateModelValueMethod | IValidateModelValueMethod[];
}

export type IValidateModel = Record<string, IValidateModelValue>;

export const onValidateError = (options: IValidateOptions, optionsModelItem: IValidateModelValue, message?: any) => {
  const error = new ValidationError(message);

  // Entire model message
  if (options.message !== undefined) error.message = options.message;
  // model item message
  else if (optionsModelItem.message !== undefined) error.message = optionsModelItem.message;

  // error
  throw error;
};

export async function validateModel(model: IValidateModel, req: express.Request, object: IValidateObject = 'body', options_?: IValidateOptions) {
  const options = merge(options_, { uriDecode: true, parse: true });

  const objectRequest = req[object] || {};

  // uri decoded keys
  const body = {};

  // uri decode &
  // parse the values
  // to their original value
  Object.keys(objectRequest).forEach(key => body[options.uriDecode ? decodeURIComponent(key) : key] = options.parse ? parse(objectRequest[key]) : objectRequest[key]);

  // Move through all the
  // model keys, for each key
  // get all the properties, values
  // validate all the validations
  // for each property, first one that fails
  // throw an error
  const properties = Object.keys(model);

  for (const property of properties) {
    const optionsProperty = model[property];

    const values = property === '' ? { [object]: body } : getObjectProperties(body, property, false);

    const keys = Object.keys(values);

    for (const key of keys) {
      const name = optionsProperty.name !== undefined ? optionsProperty.name : key;

      const value = values[key];

      // value validate
      // with options above

      // required
      if (optionsProperty.required) {
        const response = value;

        if (response === undefined) onValidateError(options, optionsProperty, `${name} is required`);
      }

      // is
      const is_ = ((is('array', optionsProperty.is) ? optionsProperty.is : [optionsProperty.is]) as IValidateModelValueIs[]).filter(Boolean);

      for (const item of is_) {
        const itemType = item?.type || item;
        const itemOptions = item?.options || undefined;

        const response = is(itemType as TIsType, value, itemOptions);

        if (!response) onValidateError(options, optionsProperty, `${name} has to be a valid ${itemType}`);
      }

      // is valid
      const isValid_ = ((is('array', optionsProperty.isValid) ? optionsProperty.isValid : [optionsProperty.isValid]) as IValidateModelValueIsValid[]).filter(Boolean);

      for (const item of isValid_) {
        const itemType = item?.type || item;
        const itemOptions = item?.options || undefined;

        const response = isValid(itemType as TIsValidType, value, itemOptions);

        if (!response) onValidateError(options, optionsProperty, `${name} has to be a valid ${itemType}`);
      }

      // of
      const of_ = ((is('array', optionsProperty.of) ? optionsProperty.of : [optionsProperty.of]) as IValidateModelValueIs[]).filter(Boolean);

      if (is('array', value)) {
        const response = value.every(valueItem => {
          return of_.some(item => {
            const itemType = item?.type || item;
            const itemOptions = item?.options || undefined;

            return is(itemType as any, valueItem, itemOptions);
          });
        });

        if (!response) onValidateError(options, optionsProperty, `${name} items have to be one of ${of_.map(item => item?.type || item).join(', ')}`);
      }

      // ofValid
      const ofValid = ((is('array', optionsProperty.ofValid) ? optionsProperty.ofValid : [optionsProperty.ofValid]) as IValidateModelValueIs[]).filter(Boolean);

      if (is('array', value)) {
        const response = value.every(valueItem => {
          return ofValid.some(item => {
            const itemType = item?.type || item;
            const itemOptions = item?.options || undefined;

            return isValid(itemType as any, valueItem, itemOptions);
          });
        });

        if (!response) onValidateError(options, optionsProperty, `${name} items have to be one of valid ${ofValid.map(item => item?.type || item).join(', ')}`);
      }

      // equal
      if (optionsProperty.equal !== undefined) {
        const response = value === optionsProperty.equal;

        if (!response) onValidateError(options, optionsProperty, `${name} has to be equal to ${stringify(optionsProperty.equal)}`);
      }

      // not equal
      if (optionsProperty.equal !== undefined) {
        const response = value !== optionsProperty.equal;

        if (!response) onValidateError(options, optionsProperty, `${name} has to not be equal to ${stringify(optionsProperty.equal)}`);
      }

      // equal deep
      if (optionsProperty.equalDeep !== undefined) {
        const response = equalDeep(value, optionsProperty.equalDeep);

        if (!response) onValidateError(options, optionsProperty, `${name} has to be equal to ${stringify(optionsProperty.equalDeep)}`);
      }

      // not equal deep
      if (optionsProperty.notEqualDeep !== undefined) {
        const response = !equalDeep(value, optionsProperty.notEqualDeep);

        if (!response) onValidateError(options, optionsProperty, `${name} has to not be equal to ${stringify(optionsProperty.notEqualDeep)}`);
      }

      // some
      if (is('array', optionsProperty.some)) {
        let response: boolean;

        if (is('string', value)) {
          response = !!optionsProperty.some.find(item => equalDeep(value, item));

          if (!response) onValidateError(options, optionsProperty, `${name} has to be one of ${optionsProperty.some.map(item => stringify(item)).join(', ')}`)
        }
        else if (is('array', value)) {
          response = value.some(item => !!optionsProperty.some.find(item_ => equalDeep(item, item_)));

          if (!response) onValidateError(options, optionsProperty, `${name} has to include some of ${optionsProperty.some.map(item => stringify(item)).join(', ')}`)
        }
      }

      // in
      // every
      const every = optionsProperty.in || optionsProperty.every;

      if (is('array', every)) {
        let response: boolean;

        if (is('string', value)) {
          response = !!every.find(item => equalDeep(value, item));

          if (!response) onValidateError(options, optionsProperty, `${name} has to be one of ${every.map(item => stringify(item)).join(', ')}`)
        }
        else if (is('array', value)) {
          response = value.every(item => !!every.find(item_ => equalDeep(item, item_)));

          if (!response) onValidateError(options, optionsProperty, `${name} has to include one of ${every.map(item => stringify(item)).join(', ')}`)
        }
      }

      // properties
      if (is('array', optionsProperty.properties)) {
        const allowed = optionsProperty.properties;

        const keys = Object.keys(value);

        const response = keys.every(item => allowed.includes(item));

        if (!response) onValidateError(options, optionsProperty, `${name} allowed properties are ${allowed.join(', ')}`);
      }

      // not properties
      if (is('array', optionsProperty.notProperties)) {
        const notAllowed = optionsProperty.notProperties;

        const keys = Object.keys(value);

        const response = keys.every(item => !notAllowed.includes(item));

        if (!response) onValidateError(options, optionsProperty, `${name} includes not allowed property. Not allowed properties are ${notAllowed.join(', ')}`);
      }

      // min
      // max
      // length
      if (
        ![undefined, null].includes(value) &&
        (
          is('number', optionsProperty.min) ||
          is('number', optionsProperty.max) ||
          is('number', optionsProperty.length)
        )
      ) {
        let length: number = value as number;

        // object
        if (is('object', value)) length = Object.keys(value).length;
        // number
        else if (is('number', value)) length = value;
        // string, array, map, etc.
        else {
          length = value?.length !== undefined ? value?.length : value?.size;
        }

        if (is('number', optionsProperty.min)) {
          const response = length >= optionsProperty.min;

          if (!response) onValidateError(options, optionsProperty, `${name} has to be minimum ${optionsProperty.min}`);
        }

        if (is('number', optionsProperty.max)) {
          const response = length <= optionsProperty.max;

          if (!response) onValidateError(options, optionsProperty, `${name} can be maximum ${optionsProperty.max}`);
        }

        if (is('number', optionsProperty.length)) {
          const response = length === optionsProperty.length;

          if (!response) onValidateError(options, optionsProperty, `${name} has to be exactly ${optionsProperty.length} in length/size`);
        }
      }

      // method
      const methods = ((is('array', optionsProperty.method) ? optionsProperty.method : [optionsProperty.method]) as IValidateModelValueMethod[]).filter(Boolean);

      for (const method_ of methods) {
        try {
          // either throw error or Promise.reject or return false
          const response = await method_(
            value,
            {
              request: req,
              object: body,
              property,
              path: key,
              options: optionsProperty
            }
          );

          if (!response) throw new ValidationError(`${name} is invalid`);
        }
        catch (error) {
          const messageValue = error?.message !== undefined ? error.message : error;

          onValidateError(options, optionsProperty, messageValue);
        }
      }
    }
  }
}

export function validate(model: IValidateModel, object: IValidateObject = 'body', options_?: IValidateOptions) {
  const options = merge(options_, { uriDecode: true, parse: true });

  async function method(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      // validate model
      await validateModel(model, req, object, options);

      // it's valid
      // move on to the next method
      return next();
    }
    catch (error) {
      // in order
      // for error middleware
      // to manage the error
      return next(error);
    }
  }

  return method;
}
