const express = require('express');
const logger = require('morgan');
const { Url } = require('./models')

const app = express();
const PORT = 3000;

app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', async function (req, res) {
  // Отображает список коротких URL
  let { error } = req.query
  error = error ? decodeURI(error) : ''
  const errorMessage = error.slice(error.indexOf(':') + 1)
  const links = await Url.findAll()
  res.render('index', { title: 'Url shortener', allLinks: links, errorMessage });
});

async function makeShortUrl() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const allShortUrls = await Url.findOne({
    where: { shortUrl: result }
  })
  if (!allShortUrls) {
    return result
  }
  else {
    return makeShortUrl()
  }
}

app.post('/urls', async function (req, res) {
  try {
    // Создать новый объект 'Url'
    // Автоматически создаются короткие  URL
    // В конце надо вернуться обратно на домашнюю страницу
    const randomShort = await makeShortUrl()

    const urlObj = await Url.create({
      longUrl: req.body.longUrl,
      shortUrl: randomShort
    })

    res.redirect('/')
  } catch (error) {
    console.log(error.message)
    res.redirect(`/?error=${error.message}`)
  }


});

app.get('/:shortUrl', async function (req, res, next) {
  const shortUrlObj = await Url.findOne({
    where: {
      shortUrl: req.params.shortUrl
    }
  })
  const reddirectLink = shortUrlObj ? shortUrlObj.longUrl : '/'
  res.redirect(reddirectLink)
  // Перейти по короткому к соответствующему "длинному" URL
});

app.listen(PORT, () => {
  console.log(`server started PORT: ${PORT}`);
})
