const request = require('request-promise')
const crypto = require('crypto');

class Translator { 
  constructor (config) {
    this.config = config
  }

  /**
   * @description 对自建站进行md5加密
   * @param { str: string } 字符串 
   * @returns 
   */
  md5 (str) {
    return crypto.createHash("md5").update(str).digest('hex');
  }

  /**
   * @description 生成[0,n]区间的随机整数
   * @param { max: number } 区间最大值
   * 比如生成[0,100]的闭区间随机整数，getRandomN(100)
   */
  getRandomNum (max) {
    return Math.round(Math.random() * max);
  }

  /**
   * @description 请求参数转query
   * @param { params: Object } 请求对象
   * @returns { string }
   * {a:'111',b:'222'} => a=111&b=222
   */
  generateUrlParams(params) {
    const paramsData = [];
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        paramsData.push(key + '=' + params[key]);
      }
    }
    return paramsData.join('&');
  }

  /**
   * @description 调用翻译api
   * @param { q: string } 请求翻译query
   * @returns { Promise<String> }
   */
  translate (q) {
    const { method, appKey, host, from, to, secretKey } = this.config
    let salt = this.getRandomNum(1000);                                // 随机码
    let sign = this.generateSign(appKey + q + salt + secretKey);          // 签名
    let paramsJson = {
      q: encodeURI(q),                                       // 中文需要进行uri编码
      appKey,
      from,
      to,
      appid: appKey,                                                 // 百度
      salt,
      sign,
    }
    let url = host + '?' + this.generateUrlParams(paramsJson);
    return request[method](url);
  }

  /**
   * @description 生成签名
   * @param { appKey: string | number } 应用ID
   * @param { q: string } 请求翻译query
   * @param { salt: number | string }  随机数
   * @param { secretKey: string | number }  应用秘钥
   * @returns { string } 签名
   */
  generateSign (str) {
    return this.md5(str);
  }
}


module.exports = Translator