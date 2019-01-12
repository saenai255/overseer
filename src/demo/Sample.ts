import Requisite from "../core/Requisite";
import SomeService from "./SomeService";

@Requisite
export default class Sample {
    constructor(private someService: SomeService) {}
}