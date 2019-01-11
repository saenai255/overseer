import Requisite from "../core/Requisite";
import SomeService from "./SomeService";

@Requisite
export default class Sample {
    private prerequisites: any[] = [
        SomeService
    ];

    private someService: SomeService;
}