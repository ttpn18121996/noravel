import { _obj } from "tiny-supporter";

export type ConfigLoader = Record<string, unknown>;

export interface DataConfig {
  basePath: string;
  configs: Record<string, ConfigLoader>;
}

export default class Config {
  private configs: Record<string, ConfigLoader>;
  private static _instance: Config;

  private constructor() {
    this.configs = {};
  }

  public static getInstance(): Config {
    if (!Config._instance) {
      Config._instance = new Config();
    }

    return Config._instance;
  }

  loadConfig(loaders: Record<string, ConfigLoader> = {}): this {
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
