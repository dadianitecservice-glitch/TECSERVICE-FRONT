import commonKa from './catalogs/common.ka.json' with { type: 'json' }
import commonEn from './catalogs/common.en.json' with { type: 'json' }
import devicesKa from './catalogs/devices.ka.json' with { type: 'json' }
import devicesEn from './catalogs/devices.en.json' with { type: 'json' }
import recoveryKa from './catalogs/recovery.ka.json' with { type: 'json' }
import recoveryEn from './catalogs/recovery.en.json' with { type: 'json' }
import equipmentKa from './catalogs/equipment.ka.json' with { type: 'json' }
import equipmentEn from './catalogs/equipment.en.json' with { type: 'json' }
import { installEnglishCatalogs } from './translateRuntime.ts'

// Existing synchronous metadata, schema and Node consumers keep their eager API.
// Browser rendering imports the runtime and prepares only the active language.
installEnglishCatalogs([
  [commonKa, commonEn], [devicesKa, devicesEn],
  [recoveryKa, recoveryEn], [equipmentKa, equipmentEn],
])

export { localizedHref, prepareTranslations, translateText, translateValue } from './translateRuntime.ts'
