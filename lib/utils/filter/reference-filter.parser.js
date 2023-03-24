"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferenceParser = void 0;
exports.ReferenceParser = {
    isParserForType: (filter) => filter.property.type() === 'reference',
    parse: (filter) => {
        const [column, pk] = filter.property.column.propertyPath.split('.');
        return { filterKey: column, filterValue: { [pk]: filter.value } };
    },
};
//# sourceMappingURL=reference-filter.parser.js.map