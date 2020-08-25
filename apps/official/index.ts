import { AppConfig, LayerType } from "../../src/app-config.types"
import { AnimatedLogo } from "./components/AnimatedLogo"
import buildJSON from "./build.json"
import { Welcome } from "./components/pages/Welcome"
import { About } from "./components/pages/About"
import { Imprint } from "./components/pages/Imprint"
import { CovMapFeatureInfo } from "./components/CovMapFeatureInfo"
import { CovMapWelcome } from './components/CovMapWelcome'
import { Questions } from './components/pages/Questions'

const CovMapMappables = [{
  property: 'cases_per_population_norm',
  title: 'Contact Index C',
  default: true
}, {
  property: 'cases_norm',
  title: 'Fälle',
}, {
  property: 'deaths_norm',
  title: 'Verstorbene',
}, {
  property: 'cases_per_100k_norm',
  title: 'Fälle pro 100k Einwohner',
}, {
  property: 'death_rate_norm',
  title: 'Sterberate',
}]

const CovMapSearch = {
  placeholder: 'Landkreis',
  nameProp: 'name',
  inMappings: [{
    id: 'case-numbers-to-districts',
    properties: ['name'],
    getCoordinates: (feature) => {
      return feature.properties.geo_point_2d
    }
  }],
  notFoundMessage: 'Leider keinen Landkreis gefunden.'
}

export const config: AppConfig = {
  ui: {
    Logo: AnimatedLogo
  },
  content: {
    pages: [{
      id: 'about-page',
      title: 'Info',
      route: '/about',
      Component: About
    }, {
      id: 'imprint-page',
      title: 'Impressum',
      route: '/imprint',
      Component: Imprint
    }, {
      id: 'questions-page',
      title: 'Symptome erfassen',
      route: '/questions',
      Component: Questions
    },
    ]
  },
  buildJSON,
  mapSettings: {
    constraints: [[56.47462805805594,  2.3730468750000004], [43.27103747280261, 17.885742187500004]]
  },
  defaultVisual: 'covmap',
  datasources: {
    'rki-case-numbers': {
      url: (dateString) => `https://warte.app/api/rki/rki-district-case-numbers?fields=BL,RS,EWZ,cases,deaths,cases_per_100k,cases_per_population,cases7_per_100k,death_rate&limit=0&date=${dateString}`
    }
  },
  visuals: {
    'covmap': {
      name: 'CovMap Fallzahlen',
      description: 'Tagesaktuelle Zahlen des RKI - bis jetzt',
      InfoComponent: CovMapWelcome,
      dateFormat: 'dddd, Do MMMM YYYY',
      mappings: {
        'case-numbers-to-districts': {
          datasourceId: 'rki-case-numbers',
          geoId: 'districts-city-details',
          geoProperty: 'cca_2',
          dataProperty: 'RS',
          transformData: transformRKIData
        },
        'case-numbers-to-district-points': {
          datasourceId: 'rki-case-numbers',
          geoId: 'district-points',
          geoProperty: 'cca_2',
          dataProperty: 'RS',
          transformData: transformRKIData
        }
      },
      layerGroups: [{
        id: 'areas',
        title: 'Flächen',
        mappables: CovMapMappables,
        FeatureInfo: CovMapFeatureInfo,
        layers: ['areas-fill', 'hover'],
        search: CovMapSearch,
        default: true
      }, {
        id: 'bubbles',
        title: 'Bubbles',
        mappables: CovMapMappables,
        layers: ['circles'],
        // search: RKISearch,
        FeatureInfo: CovMapFeatureInfo,
      }, {
        id: 'extrusion',
        title: 'Balken',
        mappables: CovMapMappables,
        layers: ['extrusion', 'hover'],
        FeatureInfo: CovMapFeatureInfo,
        search: CovMapSearch,
        pitch: 40,
        bearing: 20,
      }],
      layers: [
        // See the Mapbox Style Specification for details on data expressions.
        // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions
        {
          id: "circles",
          source: "case-numbers-to-district-points",
          fn: (dataField, timeKey) => ({
            type: LayerType.CIRCLE,
            paint: {
              'circle-color': [
                'interpolate',
                ['exponential', 0.05],
                ['get', dataField, ['get', timeKey]],
                0.01,
                '#f8fbff',
                1,
                '#113068'
              ],
              'circle-opacity': 0.9,
              'circle-radius': [
                'interpolate',
                ['exponential', 0.05],
                ['get', dataField, ['get', timeKey]],
                0.01,
                3,
                1,
                30
              ]
            }
          })
        },
        {
          id: "areas-fill",
          source: "case-numbers-to-districts",
          fn: (dataField, timeKey) => ({
            type: LayerType.FILL,
            paint: {
              'fill-color': [
                'interpolate',
                ['linear'],
                ['get', dataField, ['get', timeKey]],
                // ['get', dataField],
                0, '#f8fbff',
                0.025, '#e1ebf5',
                0.05, '#cadbed',
                0.1, '#a6c9df',
                0.2, '#79add2',
                0.35, '#5591c3',
                0.5, '#3771b0',
                0.65, '#205297',
                0.8, '#113068',
              ],
              'fill-opacity': 0.8,
            }
          })
        },
        {
          id: "extrusion",
          source: "case-numbers-to-districts",
          fn: (dataField, timeKey) => ({
            id: "extrusion",
            type: LayerType.FILL_EXTRUSION,
            'paint': { 
              'fill-extrusion-color': [
                'interpolate',
                ['linear'],
                ['get', dataField, ['get', timeKey]],
                0, '#f8fbff',
                0.025, '#e1ebf5',
                0.05, '#cadbed',
                0.1, '#a6c9df',
                0.2, '#79add2',
                0.35, '#5591c3',
                0.5, '#3771b0',
                0.65, '#205297',
                0.8, '#113068',
              ],
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['get', dataField, ['get', timeKey]],
                0, 1000,
                0.025, 2500,
                0.05, 5000,
                0.1, 10000,
                0.2, 20000,
                0.35, 40000,
                0.5, 60000,
                0.65, 100000,
                0.8, 160000,
              ],
              'fill-extrusion-base': 1,
              'fill-extrusion-opacity': 0.5
            }
          })
        },
        {
          id: "hover",
          source: "case-numbers-to-districts",
          fn: () => ({
            type: LayerType.LINE,
            paint: {
              'line-color': '#627BC1',
              'line-width': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                4,
                0
              ]
            }
          })
        }
      ],
    },
  },
  geos: {
    'districts-city-details': {
      url: '/data/de_districts_all.geojson'
    },
    'district-points': {
      url: '/data/de_districts_all_points.geojson'
    }
  }
}

function normalizeProperties(data, postfix, properties) {
  const minMax = properties.reduce((acc, prop) => Object.assign(acc, {
    [prop]: { min: Infinity, max: -Infinity, factor: 1 }
  }), {})
  for (const props of data) {
    for(const prop of properties) {
      const value = props[prop]
      const mm = minMax[prop]
      mm.min = Math.min(value, mm.min)
      mm.max = Math.max(value, mm.max)
    }
  }
  for(const prop of properties) {
    const mm = minMax[prop]
    mm.factor = 1 / (mm.max - mm.min)
  }
  for (const props of data) {
    for(const prop of properties) {
      props[`${prop}${postfix}`] = props[prop] * minMax[prop].factor
    }
  }
  return data
}

function transformRKIData(json) {
  if (!json.result.length) {
    return null
  }

  const normalized = normalizeProperties(json.result, '_norm', [
    'cases_per_population',
    'cases',
    'deaths',
    'cases_per_100k',
    'death_rate'
  ])

  const propertiesByCCA2 = normalized.reduce((acc, curr) => Object.assign(acc, {
    [curr.RS]: curr
  }), {})

  return {
    data: propertiesByCCA2
  };
}
