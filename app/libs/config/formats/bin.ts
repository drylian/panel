/**
 * Bin format
 */
/**
 * Enum representing the first byte identifiers used to determine the type of binary or serialized data.
 */
export enum BinBytes {
   /**
    * Byte code for null value.
    */
   NULL = 0xc0,

   /**
    * Byte code for boolean false.
    */
   FALSE = 0xc2,

   /**
    * Byte code for boolean true.
    */
   TRUE = 0xc3,

   /**
    * Byte code for uint8: Represents unsigned integers up to 255.
    */
   UINT8 = 0xcc,

   /**
    * Byte code for int8: Represents signed integers from -128 to 127.
    */
   INT8 = 0xd0,

   /**
    * Byte code for float64: Represents 64-bit floating-point numbers.
    */
   FLOAT64 = 0xcb,

   /**
    * Byte code for bin8: Represents binary data with a length up to 255 bytes.
    */
   BIN8 = 0xc5,

   /**
    * Byte code for bin16: Represents binary data with a length up to 65,535 bytes.
    */
   BIN16 = 0xc6,

   /**
    * Byte code for bin32: Represents binary data with a length up to 4,294,967,295 bytes.
    */
   BIN32 = 0xc7,

   /**
    * Byte code for FixArray: Represents arrays with up to 15 elements.
    */
   FIXARRAY_BASE = 0x90,

   /**
    * Byte code for FixMap: Represents maps (objects) with up to 15 key-value pairs.
    */
   FIXMAP_BASE = 0x80,

   /**
    * Byte code for FixStr: Represents strings with a length of up to 31 characters.
    */
   FIXSTR_BASE = 0xa0,

   /**
    * Byte code for str8: Represents strings with a length up to 255 characters.
    */
   STR8 = 0xd9,

   /**
    * Byte code for str16: Represents strings with a length up to 65,535 characters.
    */
   STR16 = 0xda,

   /**
    * Byte code for str32: Represents strings with a length up to 4,294,967,295 characters.
    */
   STR32 = 0xdb,

   /**
    * Byte code for FixInt negative: Represents small negative integers (up to -32).
    */
   FIXINT_NEGATIVE_BASE = 0xe0,

   /**
    * Byte code for FixInt positive: Represents small positive integers (up to 127).
    */
   FIXINT_POSITIVE_BASE = 0x00,

   /**
    * Byte code for date: Represents timestamp (custom encoding example).
    */
   DATE = 0xd4,

   /**
   * Byte code for undefined value.
   */
   UNDEFINED = 0xc1, 
}


export function encode(obj: any): Buffer {
   if (obj === null) {
      return Buffer.from([BinBytes.NULL]); // null
   } else if (obj === undefined) {
      return Buffer.from([BinBytes.UNDEFINED]); // undefined
   } else if (typeof obj === 'boolean') {
      return Buffer.from([obj ? BinBytes.TRUE : BinBytes.FALSE]); // true/false
   } else if (typeof obj === 'number') {
      if (Number.isInteger(obj)) {
         if (obj >= 0 && obj <= 0x7f) {
            return Buffer.from([obj]); // FixInt +
         } else if (obj >= -32 && obj < 0) {
            return Buffer.from([BinBytes.FIXINT_NEGATIVE_BASE + obj + 32]); // FixInt -
         } else if (obj >= 0 && obj <= 0xff) {
            return Buffer.concat([Buffer.from([BinBytes.UINT8]), Buffer.from([obj])]); // uint8
         } else if (obj >= -128 && obj <= 127) {
            return Buffer.concat([Buffer.from([BinBytes.INT8]), Buffer.from([obj & 0xff])]); // int8
         } else {
            const buffer = Buffer.alloc(9);
            buffer[0] = BinBytes.FLOAT64; // float64
            buffer.writeDoubleBE(obj, 1);
            return buffer;
         }
      } else {
         const buffer = Buffer.alloc(9);
         buffer[0] = BinBytes.FLOAT64; // float64
         buffer.writeDoubleBE(obj, 1);
         return buffer;
      }
   } else if (typeof obj === 'string') {
      const strBuf = Buffer.from(obj, 'utf-8');
      const length = strBuf.length;

      if (length < 32) {
         return Buffer.concat([Buffer.from([BinBytes.FIXSTR_BASE + length]), strBuf]); // FixStr
      } else if (length <= 0xff) {
         return Buffer.concat([Buffer.from([BinBytes.STR8, length]), strBuf]); // str8
      } else if (length <= 0xffff) {
         const buf = Buffer.concat([Buffer.from([BinBytes.STR16]), Buffer.alloc(2)]);
         buf.writeUInt16BE(length, 1);
         return Buffer.concat([buf, strBuf]); // str16
      } else {
         const buf = Buffer.concat([Buffer.from([BinBytes.STR32]), Buffer.alloc(4)]);
         buf.writeUInt32BE(length, 1);
         return Buffer.concat([buf, strBuf]); // str32
      }
   } else if (Array.isArray(obj)) {
      const buffers = [Buffer.from([BinBytes.FIXARRAY_BASE + obj.length])]; // FixArray
      obj.forEach((item) => {
         buffers.push(encode(item));
      });
      return Buffer.concat(buffers);
   } else if (typeof obj === 'object') {
      // Date handling
      if (obj instanceof Date) {
         const timestamp = obj.getTime();
         const seconds = Math.floor(timestamp / 1000);
         const milliseconds = timestamp % 1000;
         const buffer = Buffer.alloc(8);
         buffer.writeUInt32BE(seconds, 0);
         buffer.writeUInt32BE(milliseconds, 4);
         return Buffer.concat([Buffer.from([BinBytes.DATE]), buffer]);
      }

      // Buffer Handling (bin8, bin16, bin32)
      if (Buffer.isBuffer(obj)) {
         const length = obj.length;
         if (length <= 0xff) {
            return Buffer.concat([Buffer.from([BinBytes.BIN8, length]), obj]); // bin8
         } else if (length <= 0xffff) {
            const buf = Buffer.concat([Buffer.from([BinBytes.BIN16]), Buffer.alloc(2)]);
            buf.writeUInt16BE(length, 1);
            return Buffer.concat([buf, obj]); // bin16
         } else {
            const buf = Buffer.concat([Buffer.from([BinBytes.BIN32]), Buffer.alloc(4)]);
            buf.writeUInt32BE(length, 1);
            return Buffer.concat([buf, obj]); // bin32
         }
      }

      // Object (Map-like)
      const entries = Object.entries(obj);
      const buffers = [Buffer.from([BinBytes.FIXMAP_BASE + entries.length])]; // FixMap
      entries.forEach(([key, value]) => {
         buffers.push(encode(key)); // Key
         buffers.push(encode(value)); // Value
      });
      return Buffer.concat(buffers);
   }

   throw new Error(`Unsupported type: ${typeof obj}`);
}

export function decode(buffer: Buffer, offset = 0): [any, number] {
   const byte = buffer[offset];

   if (byte === BinBytes.NULL) return [null, offset + 1];
   if (byte === BinBytes.FALSE) return [false, offset + 1];
   if (byte === BinBytes.TRUE) return [true, offset + 1];
   if (byte === BinBytes.UNDEFINED) return [undefined, offset + 1];

   if (byte >= BinBytes.FIXINT_POSITIVE_BASE && byte <= 0x7f) return [byte, offset + 1];
   if (byte >= BinBytes.FIXINT_NEGATIVE_BASE) return [byte - 0x100, offset + 1];
   if (byte === BinBytes.UINT8) return [buffer[offset + 1], offset + 2];
   if (byte === BinBytes.INT8) return [buffer.readInt8(offset + 1), offset + 2];

   if ((byte & 0xe0) === BinBytes.FIXSTR_BASE) {
      const length = byte & 0x1f;
      return [buffer.toString('utf-8', offset + 1, offset + 1 + length), offset + 1 + length];
   }

   if (byte === BinBytes.STR8) {
      const length = buffer[offset + 1];
      return [buffer.toString('utf-8', offset + 2, offset + 2 + length), offset + 2 + length];
   }

   if (byte === BinBytes.BIN8) {
      const length = buffer[offset + 1];
      return [buffer.subarray(offset + 2, offset + 2 + length), offset + 2 + length];
   }

   if (byte === BinBytes.BIN16) {
      const length = buffer.readUInt16BE(offset + 1);
      return [buffer.subarray(offset + 3, offset + 3 + length), offset + 3 + length];
   }

   if (byte === BinBytes.BIN32) {
      const length = buffer.readUInt32BE(offset + 1);
      return [buffer.subarray(offset + 5, offset + 5 + length), offset + 5 + length];
   }

   if ((byte & 0xf0) === BinBytes.FIXARRAY_BASE) {
      const length = byte & 0x0f;
      const array: any[] = [];
      let newOffset = offset + 1;
      for (let i = 0; i < length; i++) {
         const [item, nextOffset] = decode(buffer, newOffset);
         array.push(item);
         newOffset = nextOffset;
      }
      return [array, newOffset];
   }

   if ((byte & 0xf0) === BinBytes.FIXMAP_BASE) {
      const length = byte & 0x0f;
      const map: Record<string, any> = {};
      let newOffset = offset + 1;
      for (let i = 0; i < length; i++) {
         const [key, keyOffset] = decode(buffer, newOffset);
         const [value, valueOffset] = decode(buffer, keyOffset);
         map[key] = value;
         newOffset = valueOffset;
      }
      return [map, newOffset];
   }

   if (byte === BinBytes.DATE) {
      const seconds = buffer.readUInt32BE(offset + 1);
      const milliseconds = buffer.readUInt32BE(offset + 5);
      const timestamp = seconds * 1000 + milliseconds;
      return [new Date(timestamp), offset + 9];
   }

   throw new Error(`Unsupported byte: 0x${byte.toString(16)}`);
}

export default { decode, encode, BinBytes };