import Abstracts from "../utils/Abstracts";

export default abstract class CoreError extends Error {
  public abstract handle(info: Abstracts): any;
  public abstract getStatusCode(): number;
}