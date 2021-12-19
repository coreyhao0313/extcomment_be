const src = require('../../src');
const config = require('../../config.json');
const utilsApi = require('../../utils/api');

module.exports = {
	async checkRulesAndRegister(ctx, next){
		const token = ctx.header.authorization;

		const user = token ? await src.account.getState(utilsApi.jwtTokenStr(token)) : null;

		if (user && Array.isArray(user.rules) && user.rules.includes('normal')) {
			user.token = utilsApi.jwtTokenStr(token);
			ctx.state.user = user;
			return next();
		} else {
			ctx.state.user = {
				rules: []
			};
		}

		const whitelist = config[process.env.NODE_ENV].auth.whitelist
			.map((PE)=>{
				PE.path = new RegExp(PE.path);
				if(!PE.methods){
					PE.methods = [];
				}
				return PE;
			});
		const inWhitelist = whitelist
			.some((PE)=>{
				return PE.path.test(ctx.request.path) && 
				(PE.methods.includes(ctx.method.toLowerCase()) || PE.methods[0] === 'all');
			});

		if(inWhitelist){
			return next();
		}

		ctx.status = 401;
		ctx.body = {
			code: ctx.status,
			status: 'error'
		};
	}
};