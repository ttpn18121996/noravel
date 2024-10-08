import { Express } from 'express-serve-static-core';
import type Container from '../Container';
import View from '../../View/View';

export type ServiceProviderProps = { server: Express; baseDir: string; container: Container };

export default class ServiceProvider {
  public app: Express;
  public baseDir: string;
  public container: Container;
  public view: View;

  public constructor(props: ServiceProviderProps) {
    this.app = props.server;
    this.baseDir = props.baseDir;
    this.container = props.container;
    this.view = View.getInstance();
  }

  public getBaseDir(path = '') {
    return this.baseDir + path.replace(/^\//, '');
  }

  public register(): void {
    //
  }

  public boot(): void {
    //
  }
}
