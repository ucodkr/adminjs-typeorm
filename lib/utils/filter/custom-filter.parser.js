"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomParser = void 0;
/**
 * It wasn't possible to pass raw filters to adapters with AdminJS
 * This solution allows you to pass custom filters to typeorm adapter modyfing list handler
 *
 * In your custom list handler modify creating filters in this way:
 *
 * ```
 * // That makes `Filter` class to create proper filter object.
 * filters[propertyToFilterBy] = 1;
 * const filter = await new Filter(filters, resource).populate();
 * // This parser recognizes `custom` field and passes the value directly to typeorm
 * filter.filters[propertyToFilterBy].custom = In([1,2,3]);
 *
 */
exports.CustomParser = {
    isParserForType: (filter) => filter === null || filter === void 0 ? void 0 : filter.custom,
    parse: (filter, fieldKey) => ({ filterKey: fieldKey, filterValue: filter === null || filter === void 0 ? void 0 : filter.custom }),
};
//# sourceMappingURL=custom-filter.parser.js.map