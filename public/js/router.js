// Simple client-side router

class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;

    window.addEventListener('popstate', () => this.handleRoute());
  }

  addRoute(path, handler) {
    this.routes.push({ path, handler });
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;
    const query = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(query.entries());

    for (const route of this.routes) {
      const match = this.matchRoute(route.path, path);
      if (match) {
        this.currentRoute = { ...route, params: { ...match, ...params } };
        route.handler(this.currentRoute.params);
        return;
      }
    }

    // 404 - redirect to home
    this.navigate('/');
  }

  matchRoute(routePath, actualPath) {
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');

    if (routeParts.length !== actualParts.length) {
      return null;
    }

    const params = {};

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        const paramName = routeParts[i].slice(1);
        params[paramName] = actualParts[i];
      } else if (routeParts[i] !== actualParts[i]) {
        return null;
      }
    }

    return params;
  }

  getQueryParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  }
}

export const router = new Router();
