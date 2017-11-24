'use strict'

/** Follow Followers Target **/
/** CODE BY CCOCOT | CCOCOT.CO **/
/** ccocot@bc0de.net **/
/** BC0DE.NET - NAONLAH.NET - WingKocoli **/

const Client = require('instagram-private-api').V1;
const delay = require('delay');
const chalk = require('chalk');
const rp = require('request-promise');
const _ = require('lodash');

const User = {
    username: '',
    password: ''
}

const TargetUsername = '';

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

const Target = async function(username){

	const option = {
		url: 'https://www.instagram.com/'+username+'/?__a=1',
		method: 'GET',
		json:true
	}
	try{
		const account = await rp(option);
		if (account.user.is_private) {
			return Promise.reject('Target is private Account');
		} else {
			return Promise.resolve(account.user.id)			
		}
	} catch (err){
		return Promise.reject(err);
	}

}

const Feed = async function(session, accountId, cursor){

	const feed = new Client.Feed.AccountFollowers(session, accountId);
	if (cursor) {
		feed.setCursor(cursor);
	}
	try {
		var result = await feed.get();
		const Account = [];
		await Promise.all(result.map(async(account) => {
			Account.push({id:account.params.id,username:account.params.username});
		}))
		const getCursor = await feed.getCursor();
		return Promise.resolve({Account,getCursor});
	} catch (err) {
		return Promise.reject(err);
	}
}

const Excute = async function(User, TargetUsername){

	try {
		const AccountFollowers = [];
		console.log(chalk`{bold.yellow [?] }Try to Login..`);
		const doLogin = await Login(User);
		console.log(chalk`{bold.green [+] }Login success, Try to get Id ${TargetUsername} ..`)
		const IdTarget = await Target(TargetUsername);
		console.log(chalk`{bold.green [+] }Id target found, Try to doAction..\n`)
		var cursor = null;
		var count = 0;
		do {
			const doAction = await Feed(doLogin.session, IdTarget, cursor);
			const account = _.chunk(doAction.Account,10);
			if (doAction.getCursor) {
				cursor = doAction.getCursor;
				console.log(chalk`{bold.green [+]} Detect new Cursor ${cursor}`)
			}
			for (let i = 0; i < account.length; i++) {
				await Promise.all(account[i].map(async (account) => {
					await Client.Relationship.create(doLogin.session, account.id);
					count++;
					console.log(chalk`{bold.green [${count}]} ${account.username} {bold.cyan <${account.id}>} Followed`);
				}));
				await delay(10000);
			}
			console.log(chalk`{bold.yellow [!]} Delay For 1 Minute\n`);
			await delay(60000);
		}
		while(cursor != null);
	} catch (err) {
		console.log(err);
	}

}

Excute(User,TargetUsername);