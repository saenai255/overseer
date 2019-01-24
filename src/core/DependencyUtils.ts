export default class DependencyUtils {
    public static getBaseDir(filePath: string): string {
        const paths = filePath.split('\\');
        return filePath.replace(paths[paths.length - 1], '');
    }

    
}