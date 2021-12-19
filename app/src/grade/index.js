const controller = require('../../../app/controller');

module.exports = {
    async create(data, allowRepeat){
        return controller.grade.create(data, allowRepeat);
    },
    getOne(rdkey, query, fields){
        return controller.grade.getOne(rdkey, query, fields);
    },
    getCount(rdkey, query){
        return controller.grade.getCount(rdkey, query);
    },
    deleteOne(query){
        return controller.grade.deleteOne(query);
    }
};