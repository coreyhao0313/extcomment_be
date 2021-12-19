const utilsApi = require('../../utils/api');
const src = require('../../src');

module.exports = {
	async getUserState (ctx){
		const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));

		ctx.body = {
			status: 'success',
			data: utilsApi.getFieldsData(qb.fields, ctx.state.user)
		};
	},
	async loginByGoogle (ctx) {
		const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));
		const user = await src.account.loginByGoogle(ctx.request.body.token)
			.catch((err)=>{
				ctx.throw(406);
				throw err;
			});

		ctx.body = {
			status: 'success',
			data: utilsApi.getFieldsData(qb.fields, user)
		};
	},
	async logout(ctx) {
		if(ctx.state.user._id && ctx.state.user.token){
			src.account.logout(ctx.state.user._id, ctx.state.user.token);
		}
		
		ctx.body = {
			status : "success",
			data : null
		};
	},
	async getInfo(ctx){
		const qb = utilsApi.getBase64Data(utilsApi.getQueryStr(ctx));
		const rsAccount = await src.account.findOne({_id: ctx.params.id}, qb.fields);

		if(rsAccount){
			ctx.body = {
				status: 'success',
				data: rsAccount
			};
		}else{
			ctx.body = {
				status: 'error',
				message: '查無此帳號',
				data: null
			};
		}
	}
};