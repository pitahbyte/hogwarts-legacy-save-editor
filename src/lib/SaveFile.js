const ZR = new Uint8Array([71, 86, 65, 83]),
  PR = new Uint8Array([
    82, 97, 119, 68, 97, 116, 97, 98, 97, 115, 101, 73, 109, 97, 103, 101,
  ]),
  XR = new Uint8Array([
    82, 97, 119, 69, 120, 99, 108, 117, 115, 105, 118, 101, 73, 109, 97, 103,
    101,
  ]),
  Oe = new Uint8Array([
    66, 121, 116, 101, 80, 114, 111, 112, 101, 114, 116, 121,
  ]);

class SaveFile {
  constructor(buffer, fileName) {
    this.name = fileName;
    this.buffer = buffer;
    this.view = new DataView(this.buffer);
    this.byteArray = new Uint8Array(this.buffer);
    if (this._findIndexOfUint8Array(this.byteArray, ZR) !== 0)
      throw new Error('Invalid Save Game Format');
    this.primaryOffset = this._getDBByteOffsets(PR);
    this.secondaryOffset = this._getDBByteOffsets(XR);
    const Q = this._getDBByteArray(this.primaryOffset),
      B = this._getDBByteArray(this.secondaryOffset);
    this._primaryDB = Q;
    this._secondaryDB = B;
  }

  _findIndexOfUint8Array(I, g, Q = 0) {
    const B = I.slice(Q),
      C = B.findIndex((E, o) => {
        if (g[0] !== E) return !1;
        const i = B.slice(o, o + g.length);
        for (let e = 0; e < i.length; e++) if (i[e] !== g[e]) return !1;
        return !0;
      });
    return C === -1 ? -1 : C + Q;
  }

  _getDBByteOffsets(I) {
    const g = this._findIndexOfUint8Array(this.byteArray, I),
      Q = this._findIndexOfUint8Array(this.byteArray, Oe, g);
    return {
      sizeOffset: Q + Oe.length + 2,
      dbOffset: Q + Oe.length + 2 + 4,
    };
  }

  _getDBByteArray(I) {
    const g = this.view.getInt32(I.sizeOffset, !0);
    return this.byteArray.slice(I.dbOffset, I.dbOffset + g);
  }

  _cleanSQLiteArtifacts(I) {
    return (I[27] = 0), (I[95] = 0), (I[98] = 67), (I[99] = 195), I;
  }

  generateSaveFile(I, g = null) {
    g = g || this._secondaryDB;
    const Q = this.byteArray.slice(0, this.primaryOffset.dbOffset),
      B = this.byteArray.slice(
        this.primaryOffset.dbOffset + this._primaryDB.length,
        this.primaryOffset.dbOffset +
          this._primaryDB.length +
          (this.secondaryOffset.dbOffset -
            (this.primaryOffset.dbOffset + this._primaryDB.length))
      ),
      C = this.byteArray.slice(
        this.secondaryOffset.dbOffset + this._secondaryDB.length
      ),
      E = Q.length + I.length + B.length + g.length + C.length,
      o = new Uint8Array(E);
    o.set(Q, 0),
      o.set(I, Q.length),
      o.set(B, Q.length + I.length),
      o.set(g, Q.length + I.length + B.length),
      o.set(C, Q.length + I.length + B.length + g.length);
    const i = new DataView(o.buffer, Q.length - 4, 4),
      e = new DataView(o.buffer, Q.length - 30, 4),
      a = new DataView(o.buffer, Q.length + I.length + B.length - 4, 4),
      c = new DataView(o.buffer, Q.length + I.length + B.length - 30, 4);
    return (
      i.setInt32(0, I.length, !0),
      e.setInt32(0, I.length + 4, !0),
      a.setInt32(0, g.length, !0),
      c.setInt32(0, g.length + 4, !0),
      o
    );
  }

  get primaryDB() {
    return this._primaryDB;
  }

  get secondaryDB() {
    return this._secondaryDB;
  }
}

export default SaveFile;
