export default function Prerequisite(target: any, key: string): void {
    if(!target.prototype.prerequisites) {
        target.prototype.prerequisites = [];
    }

    target.prototype.prerequisites.push(key[0].toUpperCase() + key.substring(1));
}