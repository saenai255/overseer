import Requisite from "../core/Requisite";

@Requisite
export default class SomeService {

    public sayHello(): string {
        return "hello";
    }
}