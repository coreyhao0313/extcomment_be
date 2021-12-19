const controller = require('../../../app/controller');

module.exports = {
    emit(kind, data){
        return controller.notification.emit(kind, data);
    },
    get(query, fields, options){
        return controller.notification.get(query, fields, options);
    },
    updateToRead (query){
        return controller.notification.updateToRead(query);
    },
    onMessage (key, timeout = 10000) {
        return new Promise((resolve, reject)=>{
            controller.notification.setSubscriber(key, resolve);

            setTimeout(()=>{
                controller.notification.delSubscriber(key);
                reject('timeout');
            }, timeout);
        });
    }
};