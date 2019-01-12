import Abstracts from "./Abstracts";

export default abstract class CoreError extends Error {
  public statusCode: number = 500;

  public abstract handle(info: Abstracts): any;
}
