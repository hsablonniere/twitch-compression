import { Duplex } from 'stream';

export class ResponseTransformer extends Duplex {
  constructor (transformFunction) {
    super();
    this._transformFunction = transformFunction;
    this._bufferArray = [];
  }

  _write (chunk, encoding, callback) {
    this._bufferArray.push(chunk);
    callback();
  }

  _read () {
  }

  _final () {
    const fullBuffer = Buffer.concat(this._bufferArray);
    this._transformFunction(fullBuffer).then((transformedContent) => {
      this.push(transformedContent);
      this.push(null);
    });
  }
}
