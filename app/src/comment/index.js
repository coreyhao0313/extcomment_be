const controller = require('../../../app/controller');

module.exports = {
    create(data){
        return controller.comment.create(data);
    },
    getOne(query, fields){
        return controller.comment.getOne(query, fields);
    },
    get(rdkey, query, fields, options = {}){
        return controller.comment.get(rdkey, query, fields, options);
    },
    getCount(query){
        return controller.comment.getCount(query);
    },
    update(query, data){
        return controller.comment.update(query, data);
    },
    updateToSoftDelete(query){
        return controller.comment.updateToSoftDelete(query);
    }
};