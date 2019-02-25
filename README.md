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
import { Overseer } from '@jeaks03/overseer';
Overseer.serve(module, 8000);
```

*MyController.ts*
```typescript
import { Requisite, Pathway } from '@jeaks03/overseer';

@Requisite
export default class MyController {

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
- The ```Overseer.serve(module, 8000)``` line lets the framework know where the **sources root** is located, this is done by passing the ```module``` argument, and what the port desired port is.
 - ```@Requisite``` makes transforms the class into an **injectable** and lets the framework find it. More on injectables and this decorator later.
 - ```@Pathway``` marks the method as a handler for the given path. The method is called when the endpoint is reached. More on this later.

## Documentation
Section in which I explain how the framework functions.
#### Project Structure
For the framework to work correctly it must have it's directory structure as follows:
 - index.ts -- doesn't matter where it is. Preferably in ```/src```
 - resources -- ( directory ) it must be one level above *index.ts* file. So if your main file is ```/src/index.ts``` then the resources directory must be ```/resources/```.
 - public -- ( directory ) it must be inside the resources directory. ```/resources/public```

In the **resources** directory can be stored any kind of project files you need and access them freely. Inside it is the **public** directory where all the files are visible to the http server. 

Let's say that you have a file named *index.html* inside and the server open on port *8000*. If you make a request on ```localhost:8000/index.html``` the file will be sent. 
**Note:** If the file is named ```index.html``` then the file will be available on both ```localhost:8000/index.html``` and ```localhost:8000/```

#### Decorators
Documentation details regarding the decorators.
##### @Requisite -- and dependency injection
 This decorator is used to mark the class as an injectable. Yes, Overseer also handles dependency injection in a manner similar to Angular's. In order to inject a requisite it must be a parameter for the constructor and have the same name as the class but *camelCased*.
 
 Requisite classes *must* be exported by default and have the *same name as the file*, the name must the also *PascalCased*. All requisite classes inherit an ```onInit``` method which gets called after injecting all the required injectables. It is recommended to use this method instead of the constructor to initialize your class instance.
 
 Example of dependency injection:
 *MyService.ts*
 ```typescript
 import { Requisite } from '@jeaks03/overseer';
 
 @Requisite
 export default class MyService {
     public log(message: string): void {
         console.log(message);
     }
  }
 ```
  *MyOtherService.ts*
 ```typescript
 import { Requisite } from '@jeaks03/overseer';
 import MyService from './MyService';
 
 @Requisite
 export default class MyOtherService {
    constructor(private myService: MyService) {}
 
     private onInit(): void {
         this.myService.log('I got initialized!');
     }
  }
 ```
 
 ##### @Pathway
 This decorator marks a method as the handler of the given path. It requires an argument of type ```WayDetails``` which has the following attributes:
  - path -- *string*: the path for the endpoint to map. Default: ```/```
  - method -- *string*: http method. Default: ```GET```
  - statusCode -- *number*: http status code. Default: ```200```
  - produces -- *string[]*: list of content types that can be produced by this handler. Default: ```['application/json']```
  - consumes -- *string[]*: list of content types that can be consumed by this handler. Default: ```['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded']``` 
  - guards -- *Guard[]*: list of ```Guard``` implementations. This works just like Angular's guard security. Default: ```[]```

# This documentation is a work in progress. More will be added later.
## License
[MIT License](https://github.com/paulcosma97/overseer/blob/master/LICENSE)