const router = require('express').Router();
const { errHandling } = require('../../utils/utils');
const cookieParser = require('cookie-parser');
const { getUserByName } = require('../../service/service');

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

router.use(cookieParser());

const renderData = {};

router.get(
	'/sqli',
	errHandling(async (req, res) => {
		const { nome } = req.query;
		const nomeClean = DOMPurify.sanitize(nome);
		renderData.hasUsers = 'false';
		renderData.busca = nomeClean;
		if (nomeClean != undefined) {
			const { rows } = await getUserByName(nomeClean);
			if (rows[0]) renderData.hasUsers = 'true';
			renderData.busca = nomeClean;
			renderData.users = rows;
		}

		res.render('sqli', renderData);
	})
);

module.exports = router;
