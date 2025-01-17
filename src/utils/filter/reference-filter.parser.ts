import { FilterElement } from 'adminjs'
import { Property } from '../../Property'
import { FilterParser } from './filter.types'

export const ReferenceParser: FilterParser = {
  isParserForType: (filter) => filter.property.type() === 'reference',
  parse: (filter: FilterElement) => {
    const [column] = (filter.property as Property).column.propertyPath.split(
      '.',
    )
    return { filterKey: column, filterValue: filter.value as any }
  },
}
