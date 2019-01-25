import Abstracts from "../routes/Abstracts";

export default abstract class CoreError<B, P, Q> extends Error {
  public abstract handle(info: Abstracts<B, P, Q>): any;
  public abstract getStatusCode(): number;
}
