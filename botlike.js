'use strict'

/** BOT LIKE **/
/** CODE BY CCOCOT | CCOCOT.CO **/
/** ccocot@bc0de.net **/
/** BC0DE.NET - NAONLAH.NET - WingKocoli **/

const Client = require('instagram-private-api').V1;
const delay = require('delay');
const chalk = require('chalk');

var User = {
    username: '',
    password: ''
}

const onlyUnique = async function(value, index, self) { 
    return self.indexOf(value) === index;
}

const Login = async function(User){

    /** Save Account **/
    const Device = new Client.Device(User.username);
    const Storage = new Client.CookieMemoryStorage();
    const session = new Client.Session(Device, Storage);

    try {
        await Client.Session.create(Device, Storage, User.username, User.password)
        const account = await session.getAccount();
        return Promise.resolve({session,account});
    } catch (err) {
        return Promise.reject(err);
    }

}

const Timeline = async function(session,cursor){
    var getCursor;

    /** New Feed **/
    const feed = new Client.Feed.Timeline(session);
    
    /** Cursor Detect **/
    if (cursor) {
        feed.setCursor(cursor);
    }

    try {
        const media = await feed.get();
        await Promise.all(media.map(async(media) => {
            await Like(session,media);
            
        }));
        console.log(chalk`{bold.yellow [-] DELAY FOR 1 Minute}`)
        await delay(60000);
        if (feed.isMoreAvailable()) {
            console.log(chalk`{bold.green [+]DETECT NEW CURSOR !}`)
            getCursor = feed.getCursor();
            await Timeline(session,getCursor);
        } else {
            console.log(chalk`{bold.red [!]isMoreAvailable False, Repeat}`)
            await Timeline(session,null);
        }
    } catch(err) {
        return Promise.reject(err);
    }

}

const Like = async function(session,media,username){

    try {
        if (media.params.hasLiked === false) {
            const Like = await Client.Like.create(session, media.params.id);
           console.log(chalk`[{bold.cyan ${media.id}}] Username : ${media.params.user.username} => {bold.green Liked}`);
        } else {
            console.log(chalk`[{bold.cyan ${media.id}}] Username : ${media.params.user.username} => {bold.red Already Liked}`);
        }
    } catch (err) {
        return Promise.reject(err);
    }

}

const Ekse = async function(User){
    try {
        const doLogin = await Login(User);
        await Timeline(doLogin.session,null);
    } catch (err) {
        console.log(err);
    }
}

Ekse(User);