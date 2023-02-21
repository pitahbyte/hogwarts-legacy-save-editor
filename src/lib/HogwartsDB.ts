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

  getGender(): Record<string, string> {
    const [result] = this.database.exec(
      'SELECT DataName, DataValue FROM MiscDataDynamic WHERE DataName like "%Gender%"'
    );
    return result.values.reduce(
      (obj: Record<string, string>, values: SqlValue[]) => {
        const [name, value] = values;

        if (name && value) {
          obj[name.toString()] = value.toString();
        }

        return obj;
      },
      {}
    );
  }

  getGenderSimple(): string {
    return this.getGender()['GenderRig'];
    // return genderRig.DataValue;
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

  getAppearance(): Record<string, string> {
    const [result] = this.database.exec(
      `SELECT "PresetType", "PresetName" FROM "AvatarFullBodyPresetsDynamic" WHERE "RegistryId" = "Player0"`
    );
    const { values } = result;
    return values.reduce((obj: Record<string, string>, row: SqlValue[]) => {
      const [presetType, presetName] = row;
      if (presetType) {
        obj[presetType.toString()] = presetName!.toString();
      }
      return obj;
    }, {});
  }

  clearApperanceTable() {
    this.database.exec(
      `DELETE FROM "AvatarFullBodyPresetsDynamic" WHERE "RegistryId" = "Player0"`
    );
  }

  setAppearance(features: Record<string, string>) {
    this.clearApperanceTable();
    const stmnt = this.database.prepare(
      `INSERT INTO "AvatarFullBodyPresetsDynamic" ('RegistryId', 'PresetType', 'PresetName') VALUES ('Player0', $key, $value)`
    );
    Object.keys(features).forEach((key: string) => {
      const value = features[key];
      stmnt.bind({ $key: key, $value: value });
      stmnt.step();
    });
  }

  getDBBytes() {
    return this.database.export();
  }
}

export default HogwartsDB;
