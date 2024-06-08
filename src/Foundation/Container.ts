import { _str } from 'tiny-supporter';
import Config from './Config';
import path from 'path';

export class Container {
  private baseDir: string = '/';
  private config: Config | null = null;
  private bound: Record<string, unknown> = {};
  private static _instance: Container;

  private constructor() {}

  public static getInstance(): Container {
    if (!Container._instance) {
      Container._instance = new Container();
    }

    return Container._instance;
  }

  public setBaseDir(dir: string) {
    this.baseDir = dir;
  }

  public getBaseDir(pathFile: string) {
    return path.join(this.baseDir, pathFile);
  }

  public setConfig(config: Config) {
    this.config = config;
  }

  public getConfig(key?: string | null, defaultValue: any = null) {
    return this.config?.getConfig(key, defaultValue);
  }

  public bind(abstract: string, concrete: any) {
    this.bound[abstract] = concrete;
  }

  public resolve(abstract: string, params: Record<string, any> = {}): any {
    if (this.bound?.[abstract]) {
      const concrete = this.bound[abstract];

      if (!this.isConstructor(concrete)) {
        return (concrete as Function)(this);
      }

      const dependencies = this.getArgumentNames(concrete);

      if (dependencies.length) {
        const instances = [];

        for (const dependency of dependencies) {
          instances.push(this.resolve(dependency, params));
        }

        return Reflect.construct(concrete as new (...args: any[]) => any, instances);
      }
    }

    return params?.[abstract];
  }

  private isConstructor(func: any): boolean {
    return typeof func === 'function' && !!func.prototype && func.prototype.constructor === func;
  }

  private getArgumentNames(constructor: any): string[] {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;

    if (this.isConstructor(constructor)) {
      return _str(constructor.toString())
        .replace(STRIP_COMMENTS, '')
        .betweenFirst('constructor(', ')')
        .get()
        .split(',');
    }

    const ARGUMENT_NAMES = /([^\s,]+)/g;
    const fnStr = constructor.toString().replace(STRIP_COMMENTS, '');

    return fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES) ?? [];
  }
}

export default Container;
