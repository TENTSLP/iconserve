require('dotenv').config();
const express = require("express")
const fs = require('fs')
const sharp = require('sharp')
const cors = require('cors')
const app = express()
const port = process.env.APP_PORT || 3002;

app.options('*', cors());
app.set('view engine', 'ejs');
app.use(cors({
    'origin': '*',
    'methods': 'GET,HEAD,POST',
    'preflightContinue': false
}));

let resize = function(path, format, width, height) {
        const readStream = fs.createReadStream(path)
        let transform = sharp()
        if (format) { transform = transform.toFormat(format) }
        if (width || height) { transform = transform.resize(width, height) }
    
        return readStream.pipe(transform)
}

app.get('/', function(req, res) {
    res.render('index', { title: 'SLP Token Icon Endpoint' })
})

app.get('/new', function(req, res) {
    res.render('new', { title: 'Add New Icon - SLP Token Icon Endpoint' })
})

app.get('/:size/:tokenid.:format', (req, res) => {
    const size_s = req.params.size;
    const format = req.params.format;
    const tokenid = req.params.tokenid;
    if(tokenid.match(/^[0-9a-f]{64}$/i)) {
        let size
        if (size_s) { size = parseInt(size_s) }
        if(size <= process.env.size_max || size_s == 'original') {
            if (fs.existsSync('./icons/'+tokenid+'.png')) {
                res.type(`image/${format || 'png'}`)
                res.set({'X-Image-Type': 'custom'})
                resize('./icons/'+tokenid+'.png', format, size, size).pipe(res)
            } else {
                res.status(404).json({'error':'image does not exist'})
            }
        } else {
            res.status(400).json({'error':'image dimensions must be smaller than '+process.env.size_max+' pixels'})
        }
    } else {
        res.status(400).json({'error':'invalid tokenid'})
    }

})


app.listen(port, () => {
    console.log('Iconserve is now listening at 127.0.0.1:'+port)
})
