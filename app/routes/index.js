const Router = require('koa-router');
const router = Router();

const auth = require('../middleware/auth');

const account = require('./account');
const website = require('./website');
const comment = require('./comment');
const notification = require('./notification');
const grade = require('./grade');

router.use(auth.checkRulesAndRegister);

router.get('/account/state', account.getUserState);
router.get('/account/logout', account.logout);
router.get('/account/info/:id', account.getInfo);
router.get('/website', website.getOne);
router.get('/website/info', website.getInfo);
router.get('/comment', comment.getOne);
router.get('/comments', comment.get);
router.get('/comments/count', comment.getCount);
router.get('/notification', notification.getAndRealTime);
router.get('/notifications', notification.get);
router.get('/grade', grade.getOne);
router.get('/grade/count', grade.getCount);

router.post('/account/login/google', account.loginByGoogle);
router.post('/website/signin', website.signin);
router.post('/comment', comment.create);
router.post('/grade', grade.create);

router.put('/comment', comment.update);
router.put('/website', website.update);

router.patch('/notification/read', notification.updateToRead);

router.delete('/comment', comment.delete);
router.delete('/grade', grade.delete);

module.exports = router;