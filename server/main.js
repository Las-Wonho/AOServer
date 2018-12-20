const tcp = require('net');
const match = require('./matching');
const hash = require('./database/hash');
const message = require('./message');

const server = tcp.createServer(() => {
    console.log("user connected");
});

let GameRoom = new Array(100);
let Game = match.createMatch();
let userCount = 0;
let gameCount = 0;
server.listen({
    host: '198.13.36.114',
    port: 19182,
    exclusive: true
});

server.on('listening', () => {
    console.log("Server will Started");
});

var game = new Array();


server.on('connection', (s) => {
    console.log("Socket ip is " + s.address().address);
    Game = Game(s);
    const so = message.SocketSend(s);
    game.push({sender:so,id:userCount});
    const cc = userCount;
    s.on('data', (data) => {
        const list = data.toString().split('#');
        //console.log(list);
        list.forEach(json => {
            try {
                if (json.id == 0) {
                    const jsondata = JSON.stringify(json);
                    so.Sender(jsondata);
                }
                if (json.id == 1) {
                    const user = hash.makeHash(json.user_id);
                    const jsondata = JSON.stringify({ user_id: user, x: json.x, y: json.y, z: json.z, type: json.type });
                    const result = JSON.stringify({id:json.id ,msg: jsondata });
                    game.filter(x=>(x.id!==cc)).forEach(x=>x.sender.Sender(result));
                }
            } catch (error) {
                console.log('입력 데이터가 json이 아닙니다.');
            }

        });
    });
    s.on('error',()=>{
        game = game.filter(x=>x.id!==cc);
        console.log(cc+"번째 소켓이 뒤졌습니다. 다행이 잘 초리 했을꺼에요");
    })
    
    /*
    Game = match.createMatch();
    if (userCount == 2) {
        console.log('2명이 들어와서 매칭되었습니다.');
        match.AddOnMessageAll(Game,hash.makeHash('game number'+gameCount));

        GameRoom[gameCount%10] = Game;
        gameCount += 1;
        userCount = 0;
    }
    */
    userCount += 1;
});

server.on('error', (e) => {
    console.log(e);
});