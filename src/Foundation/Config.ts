import { _obj } from "tiny-supporter";

export type ConfigLoader = {
  [key: string]: any;
};

export interface DataConfig {
  basePath: string;
  configs: { [key: string]: {} };
}

export default class Config {
  private configs: { [key: string]: ConfigLoader };
  private static _instance: Config;

  private constructor() {
    this.configs = {};
  }

  public static getInstance() {
    if (!Config._instance) {
      Config._instance = new Config();
    }

    return Config._instance;
  }

  loadConfig(loaders: { [key: string]: ConfigLoader } = {}): this {
    const loaderEntries = Object.entries(loaders);

    for (const [key, loader] of loaderEntries) {
      this.configs[key] = loader;
    }

    return this;
  }

  getConfig(key?: string | null, defaultValue: any = null): any {
    if (key === null || key === undefined || key === '') {
      return this.configs;
    }

    return _obj.get(this.configs, key, defaultValue);
  }
}
