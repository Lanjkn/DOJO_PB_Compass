const router = require('express').Router();
const { errHandling } = require('../../utils/utils');
const cookieParser = require('cookie-parser');
const { query } = require('express');
const { getNotasByUserId } = require('../../service/service');
const jwt = require('jsonwebtoken');

router.use(cookieParser());

const renderData = {};

router.get(
	'/broken_authentication_III',
	errHandling(async (req, res) => {
		const { jwt_token } = req.cookies;
		const usuarioNaoAutenticado = jwt_token == undefined;

		if (usuarioNaoAutenticado) {
			res.redirect('/user-not-authenticated');
		} else {
			res.redirect(`broken_authentication_III/notas/`);
		}
	})
);

router.get(
	'/broken_authentication_III/notas/',
	errHandling(async (req, res) => {
		const { jwt_token } = req.cookies;
		const usuarioNaoAutenticado = jwt_token == undefined;
		if (usuarioNaoAutenticado) {
			res.redirect('/user-not-authenticated');
		}
		const { user_id } = jwt.verify(jwt_token, process.env.TOKEN_KEY);

		if (!isNaN(parseInt(user_id))) {
			const { rows } = await getNotasByUserId(user_id);
			renderData.posts = rows;
			res.render('broken_authentication_III', renderData);
		} else {
			res.redirect('/user-not-authenticated');
		}
	})
);

module.exports = router;
