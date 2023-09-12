const router = require('express').Router();
const { errHandling } = require('../../utils/utils');
const cookieParser = require('cookie-parser');
const { updateUsername, getUserById } = require('../../service/service');
const { json } = require('express');
const jwt = require('jsonwebtoken');

router.use(cookieParser());

const renderData = {};

router.get(
	'/broken_authentication',
	errHandling(async (req, res) => {
		const { jwt_token } = req.cookies;
		const usuarioNaoAutenticado = jwt_token == undefined;

		if (usuarioNaoAutenticado) {
			res.render('user-not-authenticated');
		} else {
			const { user_id } = jwt.verify(jwt_token, process.env.TOKEN_KEY);
			const { rows } = await getUserById(user_id);
			renderData.username = rows[0].username;
			renderData.user_id = user_id;
			res.render('broken_authentication', renderData);
		}
	})
);

router.get(
	'/broken_authentication/alterarusername',
	errHandling(async (req, res) => {
		//CRIA A VARIAVEL COM BASE NO QUE VEIO NA URL
		const { id: user_id, novo_username } = req.query;
		renderData.user_id = user_id;
		//BUSCA NO BANCO DE DADOS SE O USUARIO EXISTE
		jwt_token = req.cookies.jwt_token;

		const { user_id: user_id_token } = jwt.verify(
			jwt_token,
			process.env.TOKEN_KEY
		);
		const usuarioAutenticado = user_id_token == user_id;
		if (!usuarioAutenticado) {
			renderData.username = 'User_id_autentication_failed';
			res.render('broken_authentication', renderData);
			return;
		}
		const { rows } = await getUserById(user_id);
		const userExiste = rows.length == 1;
		if (userExiste) {
			const { rows } = await updateUsername(novo_username, user_id);
			renderData.username = rows[0].username;
			res.render('broken_authentication', renderData);
		} else {
			renderData.username = 'User_id_not_found';
			res.render('broken_authentication', renderData);
		}
	})
);

module.exports = router;
