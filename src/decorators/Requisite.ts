const getArgs = (target) => {
    const classImpl = target.prototype.constructor.toString();
    if(!classImpl.includes('constructor(') || classImpl.includes('constructor()')) {
        return [];
    }
    return classImpl.split('constructor(')[1].split(')')[0].split(",").map(x => x.trim()).map((x: string) => x[0].toUpperCase() + x.substring(1));
}

export default function Requisite(target: any): void {
    target.prototype.isPrerequisite = true;
    target.prototype.prerequisites = getArgs(target);
}
