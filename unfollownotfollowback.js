'use strict'

/** UNFOLLOW NOT FOLLOWBACK **/
/** CODE BY CCOCOT | CCOCOT.CO **/
/** ccocot@bc0de.net **/
/** BC0DE.NET - NAONLAH.NET - WingKocoli **/

const Client = require('instagram-private-api').V1;
const delay = require('delay');
const _ = require('lodash');

const User = {
    username: '', // Your Username Instagram
    password: '', // Your Password Instagram
}

const doLogin = async function(User){

    /** Save Account **/
    const Device = new Client.Device(User.username);
    const Storage = new Client.CookieMemoryStorage();
    const session = new Client.Session(Device, Storage);

    try {
        await Client.Session.create(Device, Storage, User.username, User.password);
        const accountId = await session.getAccountId();
        return Promise.resolve({session,accountId});
    } catch (err) {
        return Promise.reject(err);
    }

}

const getFollowers = async function(session, accountId, cursor){

	const feed = new Client.Feed.AccountFollowers(session, accountId);
	if (cursor) {
		feed.setCursor(cursor);
	}
	try {
		const result = await feed.get();
		Promise.all(result.map(async(account) => {
			AccountFollowers.push(account.params.id);
		}))
		if (feed.isMoreAvailable()) {
			const getCursor = feed.getCursor();
			await getFollowers(session, accountId, getCursor);
		}
	} catch (err) {
		return Promise.reject(err);
	}
}

const getFollowing = async function(session, accountId, cursor){

	const feed = new Client.Feed.AccountFollowing(session, accountId);
	if (cursor) {
		feed.setCursor(cursor);
	}
	try {
		const result = await feed.get();
		Promise.all(result.map(async(account) => {
			AccountFollowing.push(account.params.id);
		}))
		if (feed.isMoreAvailable()) {
			const getCursor = feed.getCursor();
			await getFollowing(session, accountId, getCursor);
		}
	} catch (err) {
		return Promise.reject(err);
	}
}

const Unfollow = async function(session, accountId){
	try {
		await Client.Relationship.destroy(session, accountId);
		console.log("Unfollow %s => SUKSES", accountId);
	} catch (err){
		console.log("Unfollow %s => GAGAL", accountId);
	}
}

const Excute = async function(User){
	
	try {

		const data = await doLogin(User);
		const Followers = getFollowers(data.session,data.accountId);
		const Following = getFollowing(data.session,data.accountId);
		await Promise.all([Followers, Following]);
		await Promise.all(AccountFollowing.map(async(account) => {
			if (!AccountFollowers.includes(account)) {
				await AccountToUnfollow.push(account);
			}
		}));
		console.log("Account Followers : %s", AccountFollowers.length);
		console.log("Account Following : %s", AccountFollowing.length);
		console.log("Account To Unfollow: %s", AccountToUnfollow.length);
		console.log("Unfollow all instagram users that are not following back\n")
		AccountToUnfollow = _.chunk(AccountToUnfollow, 5);
		for (let i = 0; i < AccountToUnfollow.length; i++) {
			await Promise.all(AccountToUnfollow[i].map(async(id) => {
				await Unfollow(data.session,id);				
			}))
			await console.log('[-] Delay For 30s');
			await delay(30000);	
		}
	} catch(err){
		console.log(err);
	}
}

const AccountFollowers = [];
const AccountFollowing = [];
var AccountToUnfollow = [];

Excute(User);
