import { Filter } from 'adminjs';
import { BaseEntity, FindOptionsWhere } from 'typeorm';
export declare const convertFilter: (filterObject?: Filter | undefined) => FindOptionsWhere<BaseEntity>;
