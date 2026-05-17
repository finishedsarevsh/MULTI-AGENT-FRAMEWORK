const cleanText = (value, fallback = '', limit = 120) => {
  const text = String(value || fallback)
    .replace(/\s+/g, ' ')
    .replace(/"/g, "'")
    .replace(/@startuml|@enduml/g, '')
    .trim()

  return (text || fallback).slice(0, limit)
}

const safeAlias = (value, fallback, usedAliases) => {
  let base = String(value || fallback)
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')

  if (!base) base = fallback
  if (!/^[a-zA-Z_]/.test(base)) base = `C_${base}`

  let alias = base
  let counter = 2
  while (usedAliases.has(alias)) {
    alias = `${base}_${counter}`
    counter += 1
  }
  usedAliases.add(alias)
  return alias
}

const normalizeStereotype = (component) => {
  const raw = String(component?.stereotype || '')
    .toLowerCase()
    .replace(/[<>]/g, '')
    .trim()
  const nameBlob = `${component?.id || ''} ${component?.name || ''}`.toLowerCase()

  if (['actor', 'boundary', 'control', 'entity'].includes(raw)) return raw
  if (/(user|admin|customer|client|actor)/.test(nameBlob)) return 'actor'
  if (/(ui|frontend|screen|page|api|gateway)/.test(nameBlob)) return 'boundary'
  if (/(db|database|store|repository|model|entity)/.test(nameBlob)) return 'entity'
  return 'control'
}

const componentNote = (component) => {
  const keys = ['responsibility', 'responsibilities', 'description', 'technology']
  for (const key of keys) {
    const value = component?.[key]
    if (Array.isArray(value) && value.length > 0) {
      return cleanText(value.slice(0, 3).join('; '), '', 160)
    }
    if (value) return cleanText(value, '', 160)
  }
  return ''
}

/**
 * Converts a G-MAD architecture object into a stronger layered PlantUML diagram.
 * @param {Object} architectureJson - The JSON output from the AI debate.
 * @returns {string} - Formatted PlantUML syntax.
 */
export const generatePlantUmlString = (architectureJson) => {
  const components = Array.isArray(architectureJson?.components) ? architectureJson.components : []
  const relationships = Array.isArray(architectureJson?.relationships) ? architectureJson.relationships : []
  const usedAliases = new Set()
  const idToAlias = new Map()

  const entries = components
    .filter((component) => component && typeof component === 'object')
    .map((component, index) => {
      const originalId = String(component.id || `component_${index + 1}`)
      const alias = safeAlias(originalId, `component_${index + 1}`, usedAliases)
      idToAlias.set(originalId, alias)
      idToAlias.set(alias, alias)

      return {
        alias,
        name: cleanText(component.name, `Component ${index + 1}`, 70),
        stereotype: normalizeStereotype(component),
        note: componentNote(component),
      }
    })

  relationships
    .filter((relation) => relation && typeof relation === 'object')
    .forEach((relation) => {
      const refs = [relation.source, relation.target]
      refs.forEach((ref) => {
        const refKey = String(ref || '').trim()
        if (!refKey || idToAlias.has(refKey)) return

        const alias = safeAlias(refKey, 'external_ref', usedAliases)
        idToAlias.set(refKey, alias)
        entries.push({
          alias,
          name: cleanText(refKey, 'External Reference', 70),
          stereotype: 'boundary',
          note: 'Referenced by a relationship but missing from the component list.',
        })
      })
    })

  const relationAlias = (value) => {
    const key = String(value || '').trim()
    if (idToAlias.has(key)) return idToAlias.get(key)
    return safeAlias(key, 'external_ref', usedAliases)
  }

  const lines = [
    '@startuml',
    '!pragma layout smetana',
    'left to right direction',
    'skinparam shadowing false',
    'skinparam componentStyle rectangle',
    'skinparam wrapWidth 220',
    'skinparam maxMessageSize 140',
    'skinparam defaultTextAlignment center',
    'skinparam packageStyle rectangle',
    'skinparam ArrowColor #475569',
    'skinparam ArrowThickness 1.3',
    'skinparam component {',
    '  BorderColor #334155',
    '  FontColor #0f172a',
    '  BackgroundColor<<actor>> #dbeafe',
    '  BackgroundColor<<boundary>> #ccfbf1',
    '  BackgroundColor<<control>> #ede9fe',
    '  BackgroundColor<<entity>> #fee2e2',
    '}',
    'skinparam database {',
    '  BorderColor #334155',
    '  BackgroundColor #fee2e2',
    '}',
    `title ${cleanText(architectureJson?.systemName, 'Generated System Architecture', 90)}`,
    '',
  ]

  const groups = [
    ['actor', 'External Actors'],
    ['boundary', 'Interfaces and Entry Points'],
    ['control', 'Application Services and Orchestration'],
    ['entity', 'Data Stores and Domain Entities'],
  ]

  groups.forEach(([stereotype, title]) => {
    const groupEntries = entries.filter((entry) => entry.stereotype === stereotype)
    if (groupEntries.length === 0) return

    lines.push(`package "${title}" {`)
    groupEntries.forEach((entry) => {
      if (stereotype === 'actor') {
        lines.push(`  actor "${entry.name}" as ${entry.alias} <<actor>>`)
      } else if (stereotype === 'entity') {
        lines.push(`  database "${entry.name}" as ${entry.alias} <<entity>>`)
      } else {
        lines.push(`  component "${entry.name}" as ${entry.alias} <<${stereotype}>>`)
      }

      if (entry.note) {
        lines.push(`  note bottom of ${entry.alias}`)
        lines.push(`    ${entry.note}`)
        lines.push('  end note')
      }
    })
    lines.push('}', '')
  })

  relationships
    .filter((relation) => relation && typeof relation === 'object')
    .forEach((relation) => {
      const arrow = ['async', 'event', 'publishes', 'subscribes'].includes(
        cleanText(relation.type, '', 30).toLowerCase()
      )
        ? '..>'
        : '-->'
      lines.push(
        `${relationAlias(relation.source)} ${arrow} ${relationAlias(relation.target)} : ${cleanText(
          relation.description,
          'uses',
          90
        )}`
      )
    })

  lines.push(
    '',
    'legend right',
    '  |= Color |= Responsibility |',
    '  |<#dbeafe> Actor | External user or system |',
    '  |<#ccfbf1> Boundary | UI/API/interface layer |',
    '  |<#ede9fe> Control | Business logic and orchestration |',
    '  |<#fee2e2> Entity | Persisted data or domain object |',
    'endlegend',
    '@enduml'
  )

  return lines.join('\n')
}
