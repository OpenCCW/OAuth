

(function (_Scratch) {
  const { ArgumentType, BlockType, TargetType, Cast, translate, extensions, runtime } = _Scratch;
  const extensionId = 'dangerousCCWData';

  class CCWData {
    constructor(runtime) {
      this._formatMessage = runtime.getFormatMessage({
        'zh-cn': {
          'CCWData.name': '危险云数据',
          'CCWData.setValueInJSON': '（⚠️ 危险，仅用于作品兼容）设置[JSON]中的[KEY]的值为[VALUE]',
          'CCWData.getValueInJSON': '（⚠️ 危险，仅用于作品兼容）获得[KEY]在[JSON]中的值'
        },
        en: {
          'CCWData.name': 'Dangerous Cloud Data',
          'CCWData.getValueInJSON': '(⚠️ dangerous) get [KEY] in [JSON]',
          'CCWData.setValueInJSON': '(⚠️ dangerous) set [VALUE] of key [KEY] in [JSON]'
        },
      });
    }

    block_getValueInJSON = () => {
      return {
        opcode: 'getValueInJSON',
        text: this._formatMessage({
          id: 'CCWData.getValueInJSON',
        }),
        blockType: BlockType.REPORTER,
        disableMonitor: true,
        // hideFromPalette: true,
        arguments: {
          KEY: {
            type: ArgumentType.STRING,
            defaultValue: 'key',
          },
          JSON: {
            type: ArgumentType.STRING,
            defaultValue: '{"key":"value"}',
          },
        },
      };
    };

    block_setValueInJSON = () => {
      return {
        opcode: 'setValueInJSON',
        text: this._formatMessage({
          id: 'CCWData.setValueInJSON',
        }),
        blockType: BlockType.REPORTER,
        // hideFromPalette: true,
        disableMonitor: true,
        arguments: {
          KEY: {
            type: ArgumentType.STRING,
            defaultValue: 'key',
          },
          VALUE: {
            type: ArgumentType.STRING,
            defaultValue: 'new value',
          },
          JSON: {
            type: ArgumentType.STRING,
            defaultValue: '{"key":"value"}',
          },
        },
      };
    };

    /** Ext Info */
    getInfo() {
      return {
        id: extensionId,
        name: this._formatMessage({
          id: 'CCWData.name',
          default: 'CCWData',
        }),
        color1: '#ED35A3',
        // menuIconURI: icon,
        // blockIconURI: icon,
        blocks: [
          // this.setValueBlock(),
          // this.getValueBlock(),
          this.block_getValueInJSON(),
          this.block_setValueInJSON(),
        ],
        menus: {},
      };
    }

    getValueInJSON(args) {
      let key = Cast.toString(args.KEY);
      const json = Cast.toString(args.JSON);
      let jsonObj;
      try {
        jsonObj = JSON.parse(json);
      } catch (e) {
        return `error: ${e.message}`;
      }

      // process key into evaluable string
      if (/[()=]/gm.test(key)) {
        return `error: invalid key ${key}, cannot contain ()=`;
      }

      const key2 = `jsonObj[${key}]`;
      // process key when  json is an array
      if (Array.isArray(jsonObj)) {
        if (key.startsWith('[')) {
          key = `jsonObj${key}`;
        } else {
          key = `jsonObj[${key}]`;
        }
      } else if (/\s/gm.test(key)) {
        // return `error: invalid key ${key}, cannot contain space`;
        console.warn(`[CCW Data] warning: invalid key ${key}, space and dot cannot be used together`);
        key = `jsonObj["${key}"]`;
      } else {
        key = `jsonObj.${key}`;
      }

      let rtObj;
      // try eval
      try {
        // console.info(key, jsonObj);
        rtObj = eval(key);
      } catch (e) {
        // Try eval with key2
        try {
          // console.info(key2, jsonObj);
          rtObj = eval(key2);
          // eslint-disable-next-line no-empty
        } catch (e) {
          return `error: key or expression invalid`;
        }
      }
      if (typeof rtObj === 'object') {
        return JSON.stringify(rtObj);
      }
      return rtObj;
    }


    setValueInJSON(args) {
      const key = Cast.toString(args.KEY);
      const value = Cast.toString(args.VALUE);
      const json = Cast.toString(args.JSON);
      let jsonObj;
      try {
        jsonObj = JSON.parse(json);
      } catch (e) {
        return `error: ${e.message}`;
      }

      // process key into evaluable string
      if (/[()=]/gm.test(key)) {
        return `error: invalid key ${key}, cannot contain ()=`;
      }

      // try convert value to json object
      // eslint-disable-next-line no-new-wrappers
      let valueObj = value;
      if (/^[\[].*?[\]]$/gm.test(value) || /^[\{].*?[\}]$/gm.test(value)) {
        // is json object
        // console.info('is json object');
        try {
          valueObj = JSON.parse(value);
        } catch (e) {
          // do nothing
        }
      }

      // console.info(typeof valueObj);

      if (typeof valueObj === 'string') {
        // convert to number if possible
        if (/^-?\d*\.?\d*$/gm.test(valueObj)) {
          valueObj = Number(valueObj);
        }
      }

      // try set
      try {
        if (Array.isArray(jsonObj)) {
          jsonObj[key] = valueObj;
        } else if (/[\.\[\]]/gm.test(key)) {
          // contains . or [ or ], should eval
          // if valueObj is an object, eval should be use JSON.stringify
          if (valueObj instanceof Object) {
            valueObj = JSON.stringify(valueObj);
            valueObj = `JSON.parse('${valueObj}')`;
          } else if (typeof valueObj === 'string') {
            valueObj = `'${valueObj}'`;
          }
          // console.info(`jsonObj.${key} = ${valueObj}`);
          eval(`jsonObj.${key} = ${valueObj}`);
        } else {
          jsonObj[key] = valueObj;
        }
      } catch (e) {
        return `error: key or expression invalid`;
      }
      return JSON.stringify(jsonObj);
    }

  }


  extensions.register(new CCWData(runtime));
})(Scratch);