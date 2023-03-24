"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
const typeorm_1 = require("typeorm");
const adminjs_1 = require("adminjs");
const Property_1 = require("./Property");
const filter_converter_1 = require("./utils/filter/filter.converter");
const safe_parse_number_1 = __importDefault(require("./utils/safe-parse-number"));
class Resource extends adminjs_1.BaseResource {
    constructor(model) {
        super(model);
        this.propsObject = {};
        this.model = model;
        this.propsObject = this.prepareProps();
    }
    databaseName() {
        return this.model.getRepository().metadata.connection.options.database || 'typeorm';
    }
    databaseType() {
        return this.model.getRepository().metadata.connection.options.type || 'typeorm';
    }
    name() {
        return this.model.name;
    }
    id() {
        return this.model.name;
    }
    idName() {
        return this.model.getRepository().metadata.primaryColumns[0].propertyName;
    }
    properties() {
        return [...Object.values(this.propsObject)];
    }
    property(path) {
        return this.propsObject[path];
    }
    count(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.count(({
                where: (0, filter_converter_1.convertFilter)(filter),
            }));
        });
    }
    find(filter, 
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit = 10, offset = 0, sort = {} } = params;
            const { direction, sortBy } = sort;
            const instances = yield this.model.find({
                where: (0, filter_converter_1.convertFilter)(filter),
                take: limit,
                skip: offset,
                order: {
                    [sortBy]: (direction || 'asc').toUpperCase(),
                },
            });
            return instances.map((instance) => new adminjs_1.BaseRecord(instance, this));
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const reference = {};
            reference[this.idName()] = id;
            const instance = yield this.model.findOneBy(reference);
            if (!instance) {
                return null;
            }
            return new adminjs_1.BaseRecord(instance, this);
        });
    }
    findMany(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            const reference = {};
            reference[this.idName()] = (0, typeorm_1.In)(ids);
            const instances = yield this.model.findBy(reference);
            return instances.map((instance) => new adminjs_1.BaseRecord(instance, this));
        });
    }
    create(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = this.model.create(adminjs_1.flat.unflatten(this.prepareParams(params)));
            yield this.validateAndSave(instance);
            return instance;
        });
    }
    update(pk, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const reference = {};
            reference[this.idName()] = pk;
            const instance = yield this.model.findOneBy(reference);
            if (instance) {
                const preparedParams = adminjs_1.flat.unflatten(this.prepareParams(params));
                Object.keys(preparedParams).forEach((paramName) => {
                    const val = preparedParams[paramName];
                    if (Array.isArray(val) && val.length > 0) {
                        if (typeof val[0] === 'object') {
                            // eslint-disable-next-line no-plusplus
                            for (let i = 0; i < val.length; i++) {
                                /**
                                 * TODO Primary 키값이 있어야 한다.
                                 * ManyToMany에서 id 값이 문자열일 경우 오류가 발생한다.
                                 */
                                const b = val[i].id;
                                if (!isNaN(Number(b))) {
                                    val[i] = { id: Number(b) };
                                }
                                else {
                                    val[i] = { id: b };
                                }
                            }
                        }
                    }
                    instance[paramName] = val;
                });
                yield this.validateAndSave(instance);
                return instance;
            }
            throw new Error('Instance not found.');
        });
    }
    delete(pk) {
        return __awaiter(this, void 0, void 0, function* () {
            const reference = {};
            reference[this.idName()] = pk;
            try {
                const instance = yield this.model.findOneBy(reference);
                if (instance) {
                    yield instance.remove();
                }
            }
            catch (error) {
                if (error.name === 'QueryFailedError') {
                    throw new adminjs_1.ValidationError({}, {
                        type: 'QueryFailedError',
                        message: error.message,
                    });
                }
                throw error;
            }
        });
    }
    prepareProps() {
        const { columns } = this.model.getRepository().metadata;
        return columns.reduce((memo, col, index) => {
            const property = new Property_1.Property(col, index);
            return Object.assign(Object.assign({}, memo), { [property.path()]: property });
        }, {});
    }
    /** Converts params from string to final type */
    prepareParams(params) {
        const preparedParams = Object.assign({}, params);
        this.properties().forEach((property) => {
            const param = adminjs_1.flat.get(preparedParams, property.path());
            const key = property.path();
            // eslint-disable-next-line no-continue
            if (param === undefined) {
                return;
            }
            const type = property.type();
            if (type === 'mixed') {
                preparedParams[key] = param;
            }
            if (type === 'number') {
                if (property.isArray()) {
                    preparedParams[key] = param ? param.map((p) => (0, safe_parse_number_1.default)(p)) : param;
                }
                else {
                    preparedParams[key] = (0, safe_parse_number_1.default)(param);
                }
            }
            if (type === 'reference') {
                if (param === null) {
                    preparedParams[property.column.propertyName] = null;
                }
                else {
                    const [ref, foreignKey] = property.column.propertyPath.split('.');
                    const id = (property.column.type === Number) ? Number(param) : param;
                    preparedParams[ref] = foreignKey ? {
                        [foreignKey]: id,
                    } : id;
                }
            }
        });
        return preparedParams;
    }
    // eslint-disable-next-line class-methods-use-this
    validateAndSave(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Resource.validate) {
                const errors = yield Resource.validate(instance);
                if (errors && errors.length) {
                    const validationErrors = errors.reduce((memo, error) => (Object.assign(Object.assign({}, memo), { [error.property]: {
                            type: Object.keys(error.constraints)[0],
                            message: Object.values(error.constraints)[0],
                        } })), {});
                    throw new adminjs_1.ValidationError(validationErrors);
                }
            }
            try {
                yield instance.save();
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error('ERROR IN SAVE', error, instance);
                if (error.name === 'QueryFailedError') {
                    throw new adminjs_1.ValidationError({
                        [error.column]: {
                            type: 'QueryFailedError',
                            message: error.message,
                        },
                    });
                }
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static isAdapterFor(rawResource) {
        try {
            return !!rawResource.getRepository().metadata;
        }
        catch (e) {
            return false;
        }
    }
}
exports.Resource = Resource;
//# sourceMappingURL=Resource.js.map