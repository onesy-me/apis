import express from 'express';

import OnesyMeta from '@onesy/meta';
import { TMethod, TObject } from '@onesy/models';

// Any class with some required methods and,
// any methods interface
export interface IResponseOptions {
  method: 'json' | 'send';
  type: 'application/json';
}

export interface IRouteClassInstance {
  response: (req: express.Request, res: express.Response, next: express.NextFunction) => (response: any) => any | Promise<any>;

  error: (req: express.Request, res: express.Response, next: express.NextFunction) => (error: Error) => any | Promise<any>;

  [p: string]: any;
}

export interface IRouteClass {
  // tslint:disable-next-line
  new(...args: any[]): IRouteClassInstance;
}

export interface IRoute {
  method: 'string';
  route: 'string';
  middlewares: Array<express.RequestHandler>;
  property: 'string';
}

export type TRouteArgs = Array<string | TMethod>;

export function Routes(value: IRouteClass[], app: express.Application) {
  value.forEach(Class => {
    const instance = new Class();

    const root_route = OnesyMeta.get('route', Class);
    const middlewares = OnesyMeta.get('middlewares', Class) || [];
    const routes: Array<IRoute> = OnesyMeta.get('routes', Class) || [];

    routes.forEach(route => {
      // Register each route in the app
      app[route.method](
        // Route pathname
        `${root_route}${route.route}`.trim(),

        // Middlewares
        // Main route middlewares ran first
        ...middlewares,

        // Method instance middlewares ran after main middlewares
        ...(route.middlewares || []),

        // Main method (route), handler method
        async (req: express.Request, res: express.Response, next: express.NextFunction) => {
          try {
            // Bind class this back to the route method
            const method = instance[route.property].bind(instance);

            // If a method is not async
            // it's just converted to Promise.resolve value
            // so it will work okay regardless
            const response = await method(req, res, next);

            // If undefined
            // it means response was returned
            // within the method
            if (response !== undefined) {
              // Each class has to have response method
              if (instance.response) return await instance.response(req, res, next)(response);

              return res.status(200).json(response);
            }
          }
          catch (error) {
            // error method as well
            if (instance.error) return await instance.error(req, res, next)(error);

            return next(error);
          }
        }
      );
    });
  });
}

export function Route(...args: TRouteArgs): ClassDecorator {
  return (object: TObject) => {
    OnesyMeta.add('route', args[0], object);
    OnesyMeta.add('middlewares', args.slice(1), object);

    if (!OnesyMeta.has('routes', object)) OnesyMeta.add('routes', [], object);
  };
}

export function Method(...args: TRouteArgs): MethodDecorator {
  return (object: TObject, property: string): void => {
    if (!OnesyMeta.has('routes', object.constructor)) OnesyMeta.add('routes', [], object.constructor);

    const routes = OnesyMeta.get('routes', object.constructor) || [];

    routes.push({
      method: args[0],
      route: args[1],
      middlewares: args.slice(2),
      property,
    });

    OnesyMeta.add('routes', routes, object.constructor);
  };
}

export function Get(...args: TRouteArgs): MethodDecorator {
  return (object: TObject, property: string): void => {
    if (!OnesyMeta.has('routes', object.constructor)) OnesyMeta.add('routes', [], object.constructor);

    const routes = OnesyMeta.get('routes', object.constructor) || [];

    routes.push({
      method: 'get',
      route: args[0],
      middlewares: args.slice(1),
      property,
    });

    OnesyMeta.add('routes', routes, object.constructor);
  };
}

export function Post(...args: TRouteArgs): MethodDecorator {
  return (object: TObject, property: string): void => {
    if (!OnesyMeta.has('routes', object.constructor)) OnesyMeta.add('routes', [], object.constructor);

    const routes = OnesyMeta.get('routes', object.constructor) || [];

    routes.push({
      method: 'post',
      route: args[0],
      middlewares: args.slice(1),
      property,
    });

    OnesyMeta.add('routes', routes, object.constructor);
  };
}

export function Put(...args: TRouteArgs): MethodDecorator {
  return (object: TObject, property: string): void => {
    if (!OnesyMeta.has('routes', object.constructor)) OnesyMeta.add('routes', [], object.constructor);

    const routes = OnesyMeta.get('routes', object.constructor) || [];

    routes.push({
      method: 'put',
      route: args[0],
      middlewares: args.slice(1),
      property,
    });

    OnesyMeta.add('routes', routes, object.constructor);
  };
}

export function Patch(...args: TRouteArgs): MethodDecorator {
  return (object: TObject, property: string): void => {
    if (!OnesyMeta.has('routes', object.constructor)) OnesyMeta.add('routes', [], object.constructor);

    const routes = OnesyMeta.get('routes', object.constructor) || [];

    routes.push({
      method: 'patch',
      route: args[0],
      middlewares: args.slice(1),
      property,
    });

    OnesyMeta.add('routes', routes, object.constructor);
  };
}

export function Head(...args: TRouteArgs): MethodDecorator {
  return (object: TObject, property: string): void => {
    if (!OnesyMeta.has('routes', object.constructor)) OnesyMeta.add('routes', [], object.constructor);

    const routes = OnesyMeta.get('routes', object.constructor) || [];

    routes.push({
      method: 'head',
      route: args[0],
      middlewares: args.slice(1),
      property,
    });

    OnesyMeta.add('routes', routes, object.constructor);
  };
}

export function Options(...args: TRouteArgs): MethodDecorator {
  return (object: TObject, property: string): void => {
    if (!OnesyMeta.has('routes', object.constructor)) OnesyMeta.add('routes', [], object.constructor);

    const routes = OnesyMeta.get('routes', object.constructor) || [];

    routes.push({
      method: 'options',
      route: args[0],
      middlewares: args.slice(1),
      property,
    });

    OnesyMeta.add('routes', routes, object.constructor);
  };
}

export function Delete(...args: TRouteArgs): MethodDecorator {
  return (object: TObject, property: string): void => {
    if (!OnesyMeta.has('routes', object.constructor)) OnesyMeta.add('routes', [], object.constructor);

    const routes = OnesyMeta.get('routes', object.constructor) || [];

    routes.push({
      method: 'delete',
      route: args[0],
      middlewares: args.slice(1),
      property,
    });

    OnesyMeta.add('routes', routes, object.constructor);
  };
}
