import { _obj } from '@noravel/supporter';
import ViewComposer from './ViewComposer';

export default class View {
  private static instance: View;
  public data: Record<string, any> = {};

  private constructor() {}

  public static getInstance() {
    if (!View.instance) {
      View.instance = new View();
    }

    return View.instance;
  }

  public share(key: string, value: any) {
    this.data[key] = value;
  }

  public async composer(key: string, composer: ViewComposer) {
    this.data[key] = await composer.compose();
  }

  public get(key?: string, defaultValue?: any) {
    if (!key) {
      return this.data;
    }

    return _obj.get(this.data, key, defaultValue);
  }
}
