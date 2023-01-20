export abstract class Entity {
    toORM(): any {
        throw new Error('not implemented');
    };
    static fromORM(orm: any): Entity{
        throw new Error('not implemented');
    }

    toAPI(): any {
        throw new Error('not implemented');
    }
    toQueryKey(): {PK: string, SK: string} {
        throw new Error('not implemented');
    }
}