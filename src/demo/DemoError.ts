import CoreError from "../core/CoreError";
import Abstracts from "../core/Abstracts";

export default class DemoError extends CoreError {
  public handle(info: Abstracts): any {
    this.statusCode = 404;

    return {
      error: 'I got handled'
    };
  }
}
