const router = require('express').Router();
const { errHandling } = require('../../utils/utils');
const cookieParser = require('cookie-parser');
const { render } = require('ejs');
const { updateUsername, getUserById } = require('../../service/service');

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

router.use(cookieParser());

const renderData = {};

router.get(
	'/xss_armazenado',
	errHandling(async (req, res) => {
		const { jwt_token } = req.cookies;
		const usuarioNaoAutenticado = jwt_token == undefined;

		if (usuarioNaoAutenticado) {
			res.render('user-not-authenticated');
		} else {
			const { user_id } = jwt.verify(jwt_token, process.env.TOKEN_KEY);
			const { rows } = await getUserById(user_id);
			renderData.username = rows[0].username;
			res.render('xss_armazenado', renderData);
		}
	})
);

router.get(
	'/xss_armazenado/alterarusername',
	errHandling(async (req, res) => {
		//CRIA A VARIAVEI COM BASE NO QUE VEIO NA URL
		const { novo_username } = req.query;

		const userClean = DOMPurify.sanitize(novo_username);
		//CRIA A VARIAVEI COM BASE NO QUE ESTA NOS COOKIES
		const { jwt_token } = req.cookies;
		//BUSCA NO BANCO DE DADOS SE O USUARIO EXISTE
		const { user_id } = jwt.verify(jwt_token, process.env.TOKEN_KEY);
		const { rows } = await getUserById(user_id);
		const userExiste = rows.length == 1;
		if (userExiste) {
			const { rows } = await updateUsername(userClean, user_id);
			renderData.username = rows[0].username;
			res.render('xss_armazenado', renderData);
		} else {
			renderData.username = 'User_id_not_found';
			res.render('xss_armazenado', renderData);
		}
	})
);

module.exports = router;
