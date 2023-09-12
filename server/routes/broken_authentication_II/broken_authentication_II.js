const router = require('express').Router();
const { errHandling } = require('../../utils/utils');
const cookieParser = require('cookie-parser');
const { getUserById, updateUsername } = require('../../service/service');

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const jwt = require('jsonwebtoken');

router.use(cookieParser());

const renderData = {};

router.get(
	'/broken_authentication_II',
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
			res.render('broken_authentication_II', renderData);
		}
	})
);

router.get(
	'/broken_authentication_II/alterarusername',
	errHandling(async (req, res) => {
		//CRIA A VARIAVEI COM BASE NO QUE VEIO NA URL
		const { novo_username } = req.query;
		const nomeClean = DOMPurify.sanitize(novo_username);
		//CRIA A VARIAVEI COM BASE NO QUE ESTA NOS COOKIES
		const { jwt_token } = req.cookies;
		//BUSCA NO BANCO DE DADOS SE O USUARIO EXISTE
		const { user_id } = jwt.verify(jwt_token, process.env.TOKEN_KEY);
		const { rows } = await getUserById(user_id);
		const userExiste = rows.length == 1;
		if (userExiste) {
			const { rows } = await updateUsername(nomeClean, user_id);
			renderData.username = rows[0].username;
			res.render('broken_authentication_II', renderData);
		} else {
			renderData.username = 'User_id_not_found';
			res.render('broken_authentication_II', renderData);
		}
	})
);

module.exports = router;
