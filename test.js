import { fileURLToPath } from "url";
import Application, { ServiceProvider } from "./src/index.js";
import { dirname } from 'path';

let a =dirname(fileURLToPath(import.meta.url))
console.log(a
  // Application.configure({ basePath: dirname(fileURLToPath(import.meta.url)) }).create()
)
