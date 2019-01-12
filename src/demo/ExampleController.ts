import Requisite from "../core/Requisite";
import SomeService from "./SomeService";
import Sample from "./Sample";
import Pathway from "../core/Pathway";
import Abstracts from "../core/Abstracts";
import OnInit from "../core/OnInit";
import Greeting from "./Greeting";
import DemoError from "./DemoError";

@Requisite
export default class ExampleController implements OnInit {
    constructor(private someService: SomeService,
        private sample: Sample) {}

    public onInit(): void {
        console.log('i got instantiated');
    }

    @Pathway({path: '/home'})
    public index(): any {
        throw new DemoError();

        return {
            message: this.someService.sayHello()
        };
    }

    @Pathway({path: '/array'})
    public array(): any {
        return [
            1,2,3,4,5
        ];
    }

    @Pathway({path: '/users/:id/:group', statusCode: 302})
    public users(info: Abstracts): any {
        return info.pathParams;
    }

    @Pathway({path: '/create', method: 'post', statusCode: 201})
    public create(info: Abstracts): any {
        console.log(info.queryParams);
        console.log(info.pathParams);

        return {
            orderPlaced: info.body,
            understood: true
        };
    }

    @Pathway({path: '/greetings'})
    public greeting(info: Abstracts): any {
        const greeting = new Greeting();
        greeting.message = 'greetings';
        greeting.user = {id: 1, name: 'john doe'};

        return {
            ...greeting,
            user: undefined,
            userId: greeting.user.id
        };
    }
}
