import "reflect-metadata";

import Overseer from "./core/overseer";
import Router from "./routes/router";
import Pathway from "./decorators/pathway";
import CoreError from "./errors/core-error";
import HttpError from "./errors/http-error";
import Requisite from "./decorators/requisite";
import Route from "./routes/route";
import Abstracts, { PathInfo } from "./routes/abstracts";
import Controller from "./routes/controller"
import Redirect from "./routes/redirect"
import RequisiteInitializer from "./core/requisite-initializer";
import WayDetails from "./routes/way-details";
import Authentication from "./security/authentications/authentication";
import JWTAuthentication from "./security/authentications/jwt-authentication";
import BasicAuthentication from "./security/authentications/basic-authentication";
import AuthenticatedGuard from "./security/guards/authenticated.guard";
import AnonymousGuard from "./security/guards/anonymous.guard";
import Guard from "./security/guards/guard";
import UserDetails from "./security/user-details";
import Resources from "./core/resources";
import { AsyncFunction, Class, UserProvider, Event, EventType } from "./misc/custom-types";
import * as HttpErrorResponse from "./misc/standard-responses";
import { Requisites, RequisiteManager, RequisitePackage } from "./core/requisites";
import { GlobalConfig } from "./configs/global";

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
  Requisites,
  Resources,
  AsyncFunction,
  Class,
  UserProvider,
  RequisiteManager,
  RequisitePackage,
  GlobalConfig,
  HttpError,
  HttpErrorResponse,
  BasicAuthentication,
  JWTAuthentication,
  Event,
  EventType,
  PathInfo
};



if (process.argv[2] === 'overseer-dev') {
  Overseer.serve(module, 8000);
}