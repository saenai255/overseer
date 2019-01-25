import Overseer from "./core/Overseer";
import Router from "./routes/Router";
import Pathway from "./decorators/Pathway";
import CoreError from "./errors/CoreError";
import Requisite from "./decorators/Requisite";
import Route from "./routes/Route";
import Abstracts from "./routes/Abstracts";
import Controller from "./routes/Controller"
import Redirect from "./routes/Redirect"
import RequisiteInitializer from "./core/RequisiteInitializer";
import WayDetails from "./routes/WayDetails";
import Authentication from "./security/authentications/Authentication";
import AuthenticatedGuard from "./security/guards/AuthenticatedGuard";
import AnonymousGuard from "./security/guards/AnonymousGuard";
import Guard from "./security/guards/Guard";
import UserDetails from "./security/UserDetails";

export {
  Overseer,
  Router,
  Route,
  Pathway,
  CoreError,
  Requisite,
  Abstracts,
  WayDetails,
  Controller,
  Redirect,
  RequisiteInitializer,
  AuthenticatedGuard,
  AnonymousGuard,
  Authentication,
  Guard,
  UserDetails,
};

console.log('here')

if(process.argv[2] === 'overseer-dev') {
  Overseer.serve(module, 8000);
}