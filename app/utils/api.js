const Base64 = require('js-base64').Base64;
const jwt = require('jsonwebtoken');
const util = require('util');
const jwtVerify = util.promisify(jwt.verify);
const config = require('../config.json');

module.exports = {
    getQueryStr(ctx){
        if(ctx.request.query && ctx.request.query.query){
            return ctx.request.query.query;
        }
        return '';
    },
    getBase64Data (base64Str){
        if(base64Str){
            const qbStr = Base64.decode(base64Str);

            if(/^\{.+\}$/.test(qbStr)){
                return JSON.parse(qbStr);
            }
        }
        return {};
    },
    getFieldsData(fields, data){
        if(Object.prototype.toString.apply(data) !== '[object Object]'){
            return data;
        }
        let d = {};
        if(Array.isArray(fields)){
            for(let key of fields.filter((field)=>!/^-/.test(field))){
                let keyZoom = key.split('.').filter((key)=>key.length);
                if(keyZoom.length > 1){
                    let curD = null;
                    let toBeFinalData = JSON.parse(JSON.stringify(data));
                    let zoom = {};
                    let hasAllKey = keyZoom
                        .map(function(key, index, arr){
                            const curTemp = JSON.parse(JSON.stringify(zoom));
                            zoom = {};
                            zoom[arr[arr.length - 1 - index]] = curTemp;

                            if(Object.prototype.toString.apply(toBeFinalData) === '[object Object]'){
                                toBeFinalData = toBeFinalData[key];
                                return true;
                            }
                            return false || index + 1 === arr.length;
                        })
                        .every((hasKey)=>hasKey);
                    if(hasAllKey){
                        const firstKeyname = keyZoom.shift();
                        zoom = zoom[firstKeyname];
                        if(Object.prototype.toString.apply(d[firstKeyname]) !== '[object Object]'){
                            d[firstKeyname] = {};
                        }
                        curD = d[firstKeyname];
                        keyZoom
                            .map(function(key, index, arr){
                                if(index+1 === arr.length){
                                    curD[key] = toBeFinalData;
                                    return ;
                                }

                                zoom = zoom[key];

                                if(Object.prototype.toString.apply(curD[key]) !== '[object Object]'){
                                    curD[key] = zoom;
                                }
                                curD = curD[key];

                            });
                    }
                }else{
                    d[key] = data[key];
                }
            }
        }
        return d;
    },
    jwtTokenStr(token){
        return token.split(' ')[1];
    },
    jwtVerify(token, secret = config[process.env.NODE_ENV].auth.jwt.secret){
        return jwtVerify(this.jwtTokenStr(token), secret);
    }
};