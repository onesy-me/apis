/* tslint:disable: no-shadowed-variable */
import express from 'express';

import { assert } from '@amaui/test';

import { Routes, Route, Method, Get, Post, Put, Patch, Options, Head, Delete, IRouteClassInstance } from '../src';

group('@amaui/api', () => {

  group('decorators', () => {

    to('Route', async () => {
      const method = () => { };
      const method1 = () => { };

      @Route(
        '/a',
        method
      )
      class A implements IRouteClassInstance {

        @Method(
          'get',
          '/a',
          method1
        )
        public a() { }

        public response(req: express.Request, response: express.Response, options: { method: 'json' | 'send', type: 'application/json', }) { return; }

        public error(req: express.Request, error: Error) { return; }
      }

      const app = express();

      Routes([A], app);

      const routes = app._router.stack.map((route: any) => route.route).filter(Boolean);

      const allRoutes = [
        { path: '/a/a', method: 'get', middleware: [method, method1] },
      ];

      routes.forEach((route: any, index: number) => {
        const aRoute = allRoutes[index];

        assert(route.path).eq(aRoute.path);
        assert(route.methods[aRoute.method]).eq(true);
        assert(route.stack.map((item: any) => item.handle).slice(0, -1)).eql(aRoute.middleware);
      });
    });

    to('Method', async () => {
      const method = () => { };
      const method1 = () => { };

      @Route(
        '/a',
        method
      )
      class A implements IRouteClassInstance {

        @Method(
          'get',
          '/a',
          method1
        )
        public a() { }

        public response(req: express.Request, response: express.Response, options: { method: 'json' | 'send', type: 'application/json', }) { return; }

        public error(req: express.Request, error: Error) { return; }
      }

      const app = express();

      Routes([A], app);

      const routes = app._router.stack.map((route: any) => route.route).filter(Boolean);

      const allRoutes = [
        { path: '/a/a', method: 'get', middleware: [method, method1] },
      ];

      routes.forEach((route: any, index: number) => {
        const aRoute = allRoutes[index];

        assert(route.path).eq(aRoute.path);
        assert(route.methods[aRoute.method]).eq(true);
        assert(route.stack.map((item: any) => item.handle).slice(0, -1)).eql(aRoute.middleware);
      });
    });

    to('Get', async () => {
      const method = () => { };

      @Route(
        '/a',
        method
      )
      class A implements IRouteClassInstance {

        @Get(
          '/a'
        )
        public a() { }

        public response(req: express.Request, response: express.Response, options: { method: 'json' | 'send', type: 'application/json', }) { return; }

        public error(req: express.Request, error: Error) { return; }
      }

      const app = express();

      Routes([A], app);

      const routes = app._router.stack.map((route: any) => route.route).filter(Boolean);

      const allRoutes = [
        { path: '/a/a', method: 'get', middleware: [method] },
      ];

      routes.forEach((route: any, index: number) => {
        const aRoute = allRoutes[index];

        assert(route.path).eq(aRoute.path);
        assert(route.methods[aRoute.method]).eq(true);
        assert(route.stack.map((item: any) => item.handle).slice(0, -1)).eql(aRoute.middleware);
      });
    });

    to('Post', async () => {
      const method = () => { };

      @Route(
        '/a',
        method
      )
      class A implements IRouteClassInstance {

        @Post(
          '/a'
        )
        public a() { }

        public response(req: express.Request, response: express.Response, options: { method: 'json' | 'send', type: 'application/json', }) { return; }

        public error(req: express.Request, error: Error) { return; }
      }

      const app = express();

      Routes([A], app);

      const routes = app._router.stack.map((route: any) => route.route).filter(Boolean);

      const allRoutes = [
        { path: '/a/a', method: 'post', middleware: [method] },
      ];

      routes.forEach((route: any, index: number) => {
        const aRoute = allRoutes[index];

        assert(route.path).eq(aRoute.path);
        assert(route.methods[aRoute.method]).eq(true);
        assert(route.stack.map((item: any) => item.handle).slice(0, -1)).eql(aRoute.middleware);
      });
    });

    to('Put', async () => {
      const method = () => { };

      @Route(
        '/a',
        method
      )
      class A implements IRouteClassInstance {

        @Put(
          '/a'
        )
        public a() { }

        public response(req: express.Request, response: express.Response, options: { method: 'json' | 'send', type: 'application/json', }) { return; }

        public error(req: express.Request, error: Error) { return; }
      }

      const app = express();

      Routes([A], app);

      const routes = app._router.stack.map((route: any) => route.route).filter(Boolean);

      const allRoutes = [
        { path: '/a/a', method: 'put', middleware: [method] },
      ];

      routes.forEach((route: any, index: number) => {
        const aRoute = allRoutes[index];

        assert(route.path).eq(aRoute.path);
        assert(route.methods[aRoute.method]).eq(true);
        assert(route.stack.map((item: any) => item.handle).slice(0, -1)).eql(aRoute.middleware);
      });
    });

    to('Patch', async () => {
      const method = () => { };

      @Route(
        '/a',
        method
      )
      class A implements IRouteClassInstance {

        @Patch(
          '/a'
        )
        public a() { }

        public response(req: express.Request, response: express.Response, options: { method: 'json' | 'send', type: 'application/json', }) { return; }

        public error(req: express.Request, error: Error) { return; }
      }

      const app = express();

      Routes([A], app);

      const routes = app._router.stack.map((route: any) => route.route).filter(Boolean);

      const allRoutes = [
        { path: '/a/a', method: 'patch', middleware: [method] },
      ];

      routes.forEach((route: any, index: number) => {
        const aRoute = allRoutes[index];

        assert(route.path).eq(aRoute.path);
        assert(route.methods[aRoute.method]).eq(true);
        assert(route.stack.map((item: any) => item.handle).slice(0, -1)).eql(aRoute.middleware);
      });
    });

    to('Head', async () => {
      const method = () => { };

      @Route(
        '/a',
        method
      )
      class A implements IRouteClassInstance {

        @Head(
          '/a'
        )
        public a() { }

        public response(req: express.Request, response: express.Response, options: { method: 'json' | 'send', type: 'application/json', }) { return; }

        public error(req: express.Request, error: Error) { return; }
      }

      const app = express();

      Routes([A], app);

      const routes = app._router.stack.map((route: any) => route.route).filter(Boolean);

      const allRoutes = [
        { path: '/a/a', method: 'head', middleware: [method] },
      ];

      routes.forEach((route: any, index: number) => {
        const aRoute = allRoutes[index];

        assert(route.path).eq(aRoute.path);
        assert(route.methods[aRoute.method]).eq(true);
        assert(route.stack.map((item: any) => item.handle).slice(0, -1)).eql(aRoute.middleware);
      });
    });

    to('Options', async () => {
      const method = () => { };

      @Route(
        '/a',
        method
      )
      class A implements IRouteClassInstance {

        @Options(
          '/a'
        )
        public a() { }

        public response(req: express.Request, response: express.Response, options: { method: 'json' | 'send', type: 'application/json', }) { return; }

        public error(req: express.Request, error: Error) { return; }
      }

      const app = express();

      Routes([A], app);

      const routes = app._router.stack.map((route: any) => route.route).filter(Boolean);

      const allRoutes = [
        { path: '/a/a', method: 'options', middleware: [method] },
      ];

      routes.forEach((route: any, index: number) => {
        const aRoute = allRoutes[index];

        assert(route.path).eq(aRoute.path);
        assert(route.methods[aRoute.method]).eq(true);
        assert(route.stack.map((item: any) => item.handle).slice(0, -1)).eql(aRoute.middleware);
      });
    });

    to('Delete', async () => {
      const method = () => { };

      @Route(
        '/a',
        method
      )
      class A implements IRouteClassInstance {

        @Delete(
          '/a'
        )
        public a() { }

        public response(req: express.Request, response: express.Response, options: { method: 'json' | 'send', type: 'application/json', }) { return; }

        public error(req: express.Request, error: Error) { return; }
      }

      const app = express();

      Routes([A], app);

      const routes = app._router.stack.map((route: any) => route.route).filter(Boolean);

      const allRoutes = [
        { path: '/a/a', method: 'delete', middleware: [method] },
      ];

      routes.forEach((route: any, index: number) => {
        const aRoute = allRoutes[index];

        assert(route.path).eq(aRoute.path);
        assert(route.methods[aRoute.method]).eq(true);
        assert(route.stack.map((item: any) => item.handle).slice(0, -1)).eql(aRoute.middleware);
      });
    });

  });
});
