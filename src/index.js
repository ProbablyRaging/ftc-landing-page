require('dotenv').config();
const express = require('express');
const app = express();
const minifyCSS = require('express-minify');
const minifyHTML = require('express-minify-html-2');
const compression = require('compression')
const port = process.env.PORT;
const favicon = require('serve-favicon');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

app.use(cors());

// Minify CSS HTML
app.use(compression());
app.use(minifyCSS());
app.use(minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyJS: true
    }
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
const movedRoute = require('./routes/moved');
const errorRoute = require('./routes/error');

app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, '/views/home')
]);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Favicon
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// Middleware
app.use('/moved', movedRoute);
app.use('/error', errorRoute);

app.get('/', async (req, res) => {
    const resolve = await fetch(`https://discord.com/api/v9/guilds/${process.env.SERVER_ID}?with_counts=true`, { headers: { "Authorization": `${process.env.API_TOKEN}` } });
    const data = await resolve.json();

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    res.render('home', {
        home: true,
        user: req?.user,
        totalMembers: numberWithCommas(data.approximate_member_count),
    });
});

// Middleware to catch non-existing routes
app.use(function (req, res, next) {
    res.redirect('/error');
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});