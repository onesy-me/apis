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

export type IValidateModelValueMethod = (...args: any[]) => Promise<any> | any;

export interface IValidateModelValue {
  name?: string;

  message?: string;

  // validation
  is?: TIsType | TIsType[] | IValidateModelValueIs | IValidateModelValueIs[];
  isValid?: TIsValidType | TIsValidType[] | IValidateModelValueIsValid | IValidateModelValueIsValid[];

  // equal
  equal?: any;
  notEqual?: any;

  equalDeep?: any;
  notEqualDeep?: any;

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

export function validate(model: IValidateModel, object: IValidateObject = 'body', options_?: IValidateOptions) {
  const options = merge(options_, { uriDecode: true, parse: true });

  const onError = (optionsModelItem: IValidateModelValue, message?: any) => {
    const error = new ValidationError(message);

    // Entire model message
    if (options.message !== undefined) error.message = options.message;
    // model item message
    else if (optionsModelItem.message !== undefined) error.message = optionsModelItem.message;

    // error
    throw error;
  };

  const valid = async (req: express.Request) => {
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

      const values = getObjectProperties(body, property, false);

      const keys = Object.keys(values);

      for (const key of keys) {
        const name = optionsProperty.name !== undefined ? optionsProperty.name : key;

        const value = values[key];

        // value validate
        // with options above

        // is
        const is_ = ((is('array', optionsProperty.is) ? optionsProperty.is : [optionsProperty.is]) as IValidateModelValueIs[]).filter(Boolean);

        for (const item of is_) {
          const itemType = item?.type || item;
          const itemOptions = item?.options || undefined;

          const response = is(itemType as TIsType, value, itemOptions);

          if (!response) onError(optionsProperty, `${name} has to be a valid ${itemType}`);
        }

        // is valid
        const isValid_ = ((is('array', optionsProperty.isValid) ? optionsProperty.isValid : [optionsProperty.isValid]) as IValidateModelValueIsValid[]).filter(Boolean);

        for (const item of isValid_) {
          const itemType = item?.type || item;
          const itemOptions = item?.options || undefined;

          const response = isValid(itemType as TIsValidType, value, itemOptions);

          if (!response) onError(optionsProperty, `${name} has to be a valid ${itemType}`);
        }

        // equal
        if (optionsProperty.equal !== undefined) {
          const response = value === optionsProperty.equal;

          if (!response) onError(optionsProperty, `${name} has to be equal to ${stringify(optionsProperty.equal)}`);
        }

        // not equal
        if (optionsProperty.equal !== undefined) {
          const response = value !== optionsProperty.equal;

          if (!response) onError(optionsProperty, `${name} has to not be equal to ${stringify(optionsProperty.equal)}`);
        }

        // equal deep
        if (optionsProperty.equalDeep !== undefined) {
          const response = equalDeep(value, optionsProperty.equalDeep);

          if (!response) onError(optionsProperty, `${name} has to be equal to ${stringify(optionsProperty.equalDeep)}`);
        }

        // not equal deep
        if (optionsProperty.notEqualDeep !== undefined) {
          const response = !equalDeep(value, optionsProperty.notEqualDeep);

          if (!response) onError(optionsProperty, `${name} has to not be equal to ${stringify(optionsProperty.notEqualDeep)}`);
        }

        // properties
        if (is('array', optionsProperty.properties)) {
          const allowed = optionsProperty.properties;

          const keys = Object.keys(value);

          const response = keys.every(item => allowed.includes(item));

          if (!response) onError(optionsProperty, `${name} allowed properties are ${allowed.join(', ')}`);
        }

        // not properties
        if (is('array', optionsProperty.notProperties)) {
          const notAllowed = optionsProperty.notProperties;

          const keys = Object.keys(value);

          const response = keys.every(item => !notAllowed.includes(item));

          if (!response) onError(optionsProperty, `${name} includes not allowed property. Not allowed properties are ${notAllowed.join(', ')}`);
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

            if (!response) onError(optionsProperty, `${name} has to be minimum ${optionsProperty.min}`);
          }

          if (is('number', optionsProperty.max)) {
            const response = length <= optionsProperty.max;

            if (!response) onError(optionsProperty, `${name} can be maximum ${optionsProperty.max}`);
          }

          if (is('number', optionsProperty.length)) {
            const response = length === optionsProperty.length;

            if (!response) onError(optionsProperty, `${name} has to be exactly ${optionsProperty.length} in length/size`);
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

            onError(optionsProperty, messageValue);
          }
        }
      }
    }
  };

  async function method(req: express.Request, res: express.Response, next: express.NextFunction) {
    // validate
    await valid(req);

    // it's valid
    // move on to the next method
    return next();
  }

  return method;
}
