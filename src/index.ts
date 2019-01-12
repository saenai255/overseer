import Overseer from "./core/Overseer";
import Router from "./core/Router";


Overseer.emerge(8000);
console.log(Overseer.getRequisite<Router>('Router'));
