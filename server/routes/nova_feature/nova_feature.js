const router = require('express').Router();
const { errHandling } = require('../../utils/utils');
const cookieParser = require('cookie-parser');
const { getUserById, updateUsername } = require('../../service/service');
const multer = require('multer');
const path = require('path');

router.use(cookieParser());

const renderData = {};

// Uso do middleware 'Multer' para tratar dos uploads de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Diretório onde as imagens serao armazendas
  },
  filename: function (req, file, cb) { // Randomizacao do nome do arquivo a fim de evitar conflitos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limitacao de 5MB para o tamanho dos arquivos 
  },
  fileFilter: function (req, file, cb) { // Utilizacao de um filtro para garantir a aceitacao de arquivos '.jpeg' apenas
    if (file.mimetype.startsWith('image/jpeg')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos JPEG são permitidos.'), false);
    }
  },
});

router.get(
	'/nova_feature',
	errHandling(async (req, res) => {
		const { user_id } = req.cookies;
		const usuarioNaoAutenticado = user_id == undefined;

		if (usuarioNaoAutenticado) {
			res.render('user-not-authenticated');
		} else {
			const { rows } = await getUserById(user_id);
			renderData.username = rows[0].username;
			res.render('nova_feature', renderData);
		}
	})
);

router.post(
  '/nova_feature/teste',
  upload.single('jpegFile'),
  errHandling(async (req, res) => {
    if (req.file) {
      const { filename, originalname, size } = req.file;

      const fileInfo = {
        filename,
        originalname,
        size,
        message: 'Upload bem-sucedido',
      };

      res.status(200).json(fileInfo);
    } else {
      console.log('Erro no upload ou formato de imagem inválido');
      res.status(400).json({ error: 'Erro no upload ou formato de imagem inválido' });
    }
  })
);

module.exports = router;
