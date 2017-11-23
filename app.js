const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const Nexmo = require("nexmo")
const socketio = require("socket.io")

//Init Nexmo
const nexmo = new Nexmo({
    apiKey: '', //Need To Add
    apiSecret: '' //Need To ADD
}, { debug: true })

//Init app

const app = express()

//Template Engine Setup
app.set('view engine', 'html')
app.engine('html', ejs.renderFile)

//Public Folder Setup
app.use(express.static(__dirname + '/public'))

//Body Parser Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('index')
})

//Catch form submit
app.post('/', (req, res) => {
    // res.send(req.body)
    // console.log(req.body)

    const number = req.body.number
    const text = req.body.text

    nexmo.message.sendSms(
        '12034848616', number, text, { type: 'unicode' },
        (err, responseData) => {
            if (err) {
                console.log(err)
            }
            else {
                console.dir(responseData)
                //Get data from the response
                const data = {
                    id: responseData.messages[0]['message-is'],
                    number: responseData.messages[0]['to']
                }

                // Emit to the client
                io.emit('smsStatus', data)
            }
        }
    )
})

// Define Port

const port = process.env.PORT || 3000;

// Start server
const server = app.listen(port, () => console.log(`Server on port ${port}`))

// Connect to socket.io
const io = socketio(server)

io.on('connection', (socket) => {
    console.log('Connected')
    io.on('disconnect', () => {
        console.log('Disconnected')
    })
})
