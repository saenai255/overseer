import Redirect from "./redirect";

export default abstract class Controller {
    /**
     * Used to redirect to a certain URL
     * @param url internet address to get redirected to
     */
    public redirectTo(url: string): Redirect {
        return new Redirect(url);
    }

    /**
     * Method called on class creation
     */
    public onInit(): void {
        // override this method
    }
}