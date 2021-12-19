const {OAuth2Client} = require('google-auth-library');
const jwt = require('jsonwebtoken');
const config = require('../../config.json');
const controller = require('../../../app/controller');

module.exports = {
    create(data){
        return controller.account.create(data);
    },
    update(query, data){
        return controller.account.update(query, data);
    },
    findOne(query, fields){
        return controller.account.findOne(query, fields);
    },
    async getOneById(_id, fields){
        return controller.account.getOneById(_id, fields);
    },
    async loginByGoogle(gtoken){
        const CLIENT_ID = config[process.env.NODE_ENV].oauth.google.clientId;
		const client = new OAuth2Client(CLIENT_ID);

		let ticket = await client.verifyIdToken({
			idToken: gtoken,
			audience: CLIENT_ID
		})
		.catch((err)=>{
			return err;
        });
		if(ticket === undefined){
			throw new Error('undefined ticket');
		}
		const payload = ticket.getPayload();
		const pfid = payload['sub'];
		const email = payload['email'];
		const avatar = payload['picture'];
		const name = payload['name'];
		const nick = payload['given_name'];
		
		await this.update({pfid}, {email, avatar, name, nick});
		const dbAccount = await controller.account.findOne({pfid});

		let user = {
			_id: dbAccount._id.toString(),
			rules: dbAccount.rules,
			gtoken: gtoken,
			pfid,
			email,
			avatar,
			name,
			nick,
			_t: Date.now()
		};
		
		let token = jwt.sign({
			_id: user._id,
			email: user.email,
			avatar: user.avatar,
			name: user.name,
			nick: user.nick
		}, config[process.env.NODE_ENV].auth.jwt.secret);

		const rdToken = await controller.account.getToken(user._id);
		if(rdToken){
			controller.account.delState(rdToken);
		}

		controller.account.setToken(user._id, token);
		controller.account.setState(token, user);
		
		user.token = token;

        return user;
	},
	logout (id, token){
		controller.account.delToken(id);
		controller.account.delState(token);
	},
	async getState(token){
		return controller.account.getState(token);
	}
};