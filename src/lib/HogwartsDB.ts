import sqlWasm from '@/assets/sql-wasm.wasm?url';
import { capitalize } from '@/lib/utils';
import initSqlJs, { type SqlValue } from 'sql.js';

let Sql: initSqlJs.SqlJsStatic;
(async () => {
  Sql = await initSqlJs({ locateFile: () => sqlWasm });
})();

interface Misc {
  DataName: string;
  DataValue: string;
}

export interface Feature {
  name: string;
  value: string;
}

const Tables = {
  Misc: 'MiscDataDynamic',
  Avatar: 'AvatarFullBodyDynamic',
};

export class HogwartsDB {
  byteArray: Uint8Array;

  database: initSqlJs.Database;

  constructor(byteArray: Uint8Array) {
    this.byteArray = byteArray;
    this.database = new Sql.Database(this.byteArray.slice());
  }

  getGender(): Misc[] {
    const g = this.database.exec(
      'SELECT DataName, DataValue FROM MiscDataDynamic WHERE DataName like "%Gender%"'
    );
    return g.length
      ? g[0].values.map((values: SqlValue[]) => {
          const [name, value] = values;
          return {
            DataName: name as string,
            DataValue: value as string,
          };
        })
      : [];
  }

  getGenderSimple(): string {
    const [genderRig] = this.getGender();
    return genderRig.DataValue;
  }

  setGender(gender?: string) {
    if (!gender) {
      return;
    }

    const g = gender.toLowerCase();
    this.database.exec(
      `UPDATE ${Tables.Misc} SET DataValue = $gender WHERE DataName = "GenderRig" or DataName = "GenderVoice"`,
      {
        $gender: capitalize(g),
      }
    );
    this.database.exec(
      `UPDATE ${Tables.Misc} SET DataValue = $pronoun WHERE DataName = "GenderPronoun"`,
      { $pronoun: g === 'male' ? 'Wizard' : 'Witch' }
    );
  }

  getAppearance(): Feature[] {
    const [result] = this.database.exec(
      `SELECT "PresetType", "PresetName" FROM "AvatarFullBodyPresetsDynamic" WHERE "RegistryId" = "Player0"`
    );
    const { values } = result;
    return values.map((row: SqlValue[]) => {
      const [presetType, presetName] = row;
      return {
        name: presetType as string,
        value: presetName as string,
      };
    });
  }

  getDBBytes() {
    return this.database.export();
  }
}

export default HogwartsDB;
