import Converter from "./Converter";

export default class FormDataConverter extends Converter {
    getContentType(): string {
        return 'multipart/form-data';
    }

    canRead(target: string, contentType: string): boolean {
        return this.getContentType() === contentType;
    }
    
    canWrite(target: any, contentType: string): boolean {
        return false;
    }

    doRead(target: string): any {
        return !target ? undefined : this.parseFormData(target);
    }

    private parseFormData(body: string) {
        const result = {};
        body.split('Content-Disposition: form-data; name="')
            .filter(x => !x.startsWith('------WebKitFormBoundary'))
            .map(x => x.split('------WebKitFormBoundary')[0])
            .map(x => x.trim())
            .map(x => x.split('"'))
            .map(x => {
                x[0] = x[0].trim();
                x[1] = x[1].trim();
                return x;
            })
            .forEach(x => result[x[0]] = x[1]);

        return result;
    }
}