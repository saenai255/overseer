# Overseer

Overseer is a Typescript Aspect-Oriented framework for backend which takes inspiration from Spring-boot and Angular.

## Installation

Before you begin, make sure your development environment includes Node.js® and an npm package manager.

### Node.js
Overseer requires Node.js version 8.x or 10.x.
 - To check your version, run node -v in a terminal/console window.
 - To get Node.js, go to nodejs.org.

Creating a Overseer project is as simple as:

```bash
npx @jeaks03/typescript-base -o
```

The ```npx @jeaks03/typescript-base``` part creates a base for a typescript project and the ```-o``` flag lets the installer know that it is an Overseer framework and makes the proper adjustments.

## Minimal 'Hello World' example

*index.ts*
```typescript
import { Overseer } from '@jeaks03/overseer-core';
Overseer.serve(module, 8000);
```

*my.controller.ts*
```typescript
import { Requisite, Pathway } from '@jeaks03/overseer-core';

@Requisite
export class MyController {

    @Pathway({ path:'/hello' })
    sayHello() {
        return {
            message: 'hello world!'
        }
    }
}
```
This example opens a ```http server``` that listens on port ```8000``` and registers a ```GET``` endpoint ```/hello``` that returns the "hello world" message.
To start the application run:
```bash
npm run dev
```

#### Explaining the magic
- The ```Overseer.serve(8000)``` line lets the framework know where the **sources root** is located, and what the port desired port is.
 - ```@Requisite``` makes transforms the class into an **injectable** and lets the framework find it. More on injectables and this decorator later.
 - ```@Pathway``` marks the method as a handler for the given path. The method is called when the endpoint is reached. More on this later.

## Documentation
Section in which I explain how the framework functions.
### Project Structure
For the framework to work correctly it must have it's directory structure as follows:
 - index.ts -- doesn't matter where it is. Preferably in ```/src```
 - resources -- ( directory ) it must be one level above *index.ts* file. So if your main file is ```/src/index.ts``` then the resources directory must be ```/resources/```.
 - public -- ( directory ) it must be inside the resources directory. ```/resources/public```

In the **resources** directory can be stored any kind of project files you need and access them freely. Inside it is the **public** directory where all the files are visible to the http server. 

Let's say that you have a file named *index.html* inside and the server open on port *8000*. If you make a request on ```localhost:8000/index.html``` the file will be sent. 
**Note:** If the file is named ```index.html``` then the file will be available on both ```localhost:8000/index.html``` and ```localhost:8000/```

### Decorators
Documentation details regarding the decorators.
#### @Requisite -- and dependency injection
 This decorator is used to mark the class as an injectable. Yes, Overseer also handles dependency injection in a manner similar to Angular's. In order to inject a requisite it must be a parameter for the constructor.

 In order to let the framework find the requisites, all files that contain such classes **must** have their name ending in
  - ```.controller.ts```
  - ```.service.ts```
  - ```.component.ts```
 
 Example of dependency injection:

 *my.service.ts*
 ```typescript
 import { Requisite } from '@jeaks03/overseer-core';
 
 @Requisite
 export class MyService {
     public log(message: string): void {
         console.log(message);
     }
  }
 ```
  *my-other.service.ts*
 ```typescript
 import { Requisite } from '@jeaks03/overseer-core';
 import MyService from './my.service';
 
 @Requisite
 export class MyOtherService {
    constructor(private myService: MyService) {}
 
     private onInit(): void {
         this.myService.log('I got initialized!');
     }
  }
 ```
 
#### @Pathway
 This decorator marks a method as the handler of the given path. It requires an argument of type ```WayDetails``` which has the following attributes:
  - path -- *string*: the path for the endpoint to map. Default: ```/```
  - method -- *string*: http method. Default: ```GET```
  - statusCode -- *number*: http status code. Default: ```200```
  - produces -- *string[]*: list of content types that can be produced by this handler. Default: ```['application/json']```
  - consumes -- *string[]*: list of content types that can be consumed by this handler. Default: ```['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded']``` 
  - guards -- *Guard[]*: list of ```Guard``` implementations. This works just like Angular's guard security. Default: ```[]```

#### @LifecycleEvent
 This decorator is used on requisites to mark a method as a lifecycle event. These events are triggered at a certain time during their life.
 
 It accepts a string as a sort of *event type* to let it know when to trigger the method. These arguments are:
 - "onInit" -- method is triggered shortly after the instantiation
 - "afterInit" -- method is triggered after all requisites have been instantiated

#### @OnInit
 Shorthand version of ```@LifecycleEvent('onInit')```

#### @AfterInit
 Shorthand version of ```@LifecycleEvent('afterInit')```

### Base classes 101

#### RequisiteManager
This class handles and contains all the requisites.

An instance of this class can be imported under the name of ```Requisites``` as a ```RestrictedRequisiteManager``` interface.


RestrictedRequisiteManager:
```typescript
interface RestrictedRequisiteManager {
    addInstance: (instance, isController?: boolean) => void;
    find: <T>(clazz: Class<T>) => T;
    findByName: <T>(className: string) => T;
    findAll: <T>(clazz: Class<T>) => T[];
}
```

#### Authentication
In order to secure your application, you must provide an implementation of this class as a requisite. The default authentication 
implementation provided is ```NoAuthentication``` which basically behaves as if there is no security.

In order to create an instance for any ```Authentication``` implementation you have to pass a ```UserProvider``` to the constructor.
`UserProvider` interface is a function that looks like this: `(username: string) => UserDetails | Promise<UserDetails>`

Overseer ships with the following implementations:
- NoAuthentication
- BasicAuthentication
- JWTAuthentication

Here is an example of how to secure your application using basic auth:
```ts
export class SecurityComponent {
    constructor(private database: DatabasePlaceHolder) { }

    @OnInit()
    secureApp() {
        const auth = new BasicAuthentication((username: string) => this.database.findUser(username));
        Requisites.addInstance(auth);
    }
}
```

#### Converter
This class can be extended to create converters that understand other content types, and it looks like this:
```ts
export class Converter {
    public getContentType(): string;

    public canRead(target: string, contentType: string): boolean;
    public canWrite(target: any, contentType: string): boolean;
    
    public doWrite(target: any): string;
    public doRead(target: string): any;
}
```

### This documentation is a work in progress. More will be added later.

## License
[MIT License](https://github.com/paulcosma97/overseer/blob/master/LICENSE)