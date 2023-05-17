// Require the necessary discord.js classes
const { Client, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, codeBlock } = require('discord.js');
const { clientId, token  } = require('./config.json');
const { REST, Routes, SelectMenuBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder  } = require('discord.js');

console.log('rrrrrrrrrrrrrrr')
const XMLHttpRequest = require('xhr2');
const fs = require('node:fs');
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

var mysql = require('mysql2');
const { resolve } = require('node:path');
const { reject } = require('ramda');

var con = mysql.createConnection({
  host: "ls-25e48440f1e5122125b59df1847a9c9c7d06e1c0.cagodxgzv1qf.eu-central-1.rds.amazonaws.com",
  user: "dbmasteruser",
  password: "T]EX{q5R5p1mVn!z<-=;zPY}u!ASK4A<",
  port: "3306",
  database: "defaultdb"
});


// Create a new client instance And add commands
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages
	, GatewayIntentBits.MessageContent] });

client.once('ready', async () => {
	
	con.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
	  });

	console.log('Ready!');
});

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
	try {
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);
	} catch (error) {
		console.error(error);
	}
})();

// ************************************************************ //
client.on('interactionCreate', async interaction => {
	let member = interaction.guild.members.cache.get(interaction.user.id)
	let hasRole = member.roles.cache.some(role => role.name === 'RZ Boss')

	if (interaction.isCommand()){
		await interaction.deferReply({ ephemeral: true }).catch(err => {});
		if (interaction.commandName === 'dashboard') {
			if(hasRole)
			{
				var sql = "SELECT * from rr_subs where dc_id = '" + interaction.guild.id + "';";
				isWhitelisted = false;

				con.query(sql, async (err, result) => {
					if (err) {
						await interaction.deferReply({ ephemeral: true }).catch(err => {});
						sendErrorEmbed(interaction);
					}
					else{	
						if(result.length != 0){
							if(result[0].consumed <= result[0].quota){
								isWhitelisted = true

								try{
									const row = new ActionRowBuilder()
											.addComponents(
												new ButtonBuilder()
													.setCustomId('createbtn')
													.setLabel('Create RR')
													.setStyle(ButtonStyle.Primary),
											).addComponents(
												new ButtonBuilder()
													.setCustomId('addmissionbtn')
													.setLabel('Add Mission')
													.setStyle(ButtonStyle.Primary),
											)
											.addComponents(
												new ButtonBuilder()
													.setCustomId('rrdetailsbtn')
													.setLabel('RR Details')
													.setStyle(ButtonStyle.Secondary),
											).addComponents(
												new ButtonBuilder()
													.setCustomId('rrleaderboardbtn')
													.setLabel('RR Leaderboard')
													.setStyle(ButtonStyle.Success),
											);
			
											getProject(interaction.guild.id).then(async res => {
												let embed1 = null
												console.log(res , ' ******************')
												if(res == null){
													embed1 = embed()
												}else{
													embed1 = embed55(res)
												}
												embed1.setTitle(client.guilds.cache.get(interaction.guild.id).name + ' Dashboard')
													.setDescription('RevengerZ helps you manage and organise raiding contests, with a new concept called Raiding Runs')
												embed1.addFields({ name: 'Create RR', value: codeBlock('yaml', "Create a new Raiding Run") , inline: false })
												embed1.addFields({ name: 'RR Details', value: codeBlock('yaml',"Get Your RR Details"), inline: false })
												embed1.addFields({ name: 'RR Leaderboard', value: codeBlock('yaml',"Get The Leaderboard of a Specific RR"), inline: false })
												await interactionReply(embed1, interaction, row);
											})
											
										}catch(err){
											console.log(err)
											sendErrorEmbed(interaction);
										}
							}else{
								getProject(interaction.guild.id).then(async res => {
									let embed1 = null
									console.log(res , ' ******************')
									if(res == null){
										embed1 = embed()
									}else{
										embed1 = embed55(res)
									}
									embed1.setTitle(client.guilds.cache.get(interaction.guild.id).name + ' Dashboard')
									.setDescription('Sorry, but either you are not subscribed or your subscription has expied!')
									await interactionReply(embed1, interaction, null);
								})
							}
						}else{
							getProject(interaction.guild.id).then(async res => {
								let embed1 = null
								console.log(res , ' ******************')
								if(res == null){
									embed1 = embed()
								}else{
									embed1 = embed55(res)
								}
								embed1.setTitle(client.guilds.cache.get(interaction.guild.id).name + ' Dashboard')
									.setDescription('Sorry, but either you are not subscribed or your subscription has expied!')
								await interactionReply(embed1, interaction, null);
							})
						}
					}
				})
						
			}
			else{
				getProject(interaction.guild.id).then(async res => {
					let embed1 = null
					console.log(res , ' ******************')
					if(res == null){
						embed1 = embed()
					}else{
						embed1 = embed55(res)
					}
				embed1.setTitle(client.guilds.cache.get(interaction.guild.id).name + ' Dashboard')
				embed1.setDescription('You haven\'t "*RZ Boss*" role')
				await interactionReply(embed1, interaction, null);
				})
			}
		}
	}
	else if (interaction.isButton()) {
		console.log(' ------------------- ')
		if(interaction.customId === 'createbtn')
		{
			console.log(' oooooooooooooooooooo ')
				const modal = new ModalBuilder()
					.setCustomId('createrrmodal')
					.setTitle('Create New RR');

				const tokenaddress = new TextInputBuilder()
					.setCustomId('rrnameinput')
					.setLabel("RR Title")
					.setStyle(TextInputStyle.Short);

				const tokenname = new TextInputBuilder()
					.setCustomId('rrrewardinput')
					.setLabel("Reward")
					.setStyle(TextInputStyle.Short);

				const claimrate = new TextInputBuilder()
					.setCustomId('nbpointsinput')
					.setLabel("Total Points Target")
					.setStyle(TextInputStyle.Short);

				const tokenaddressRow = new ActionRowBuilder().addComponents(tokenaddress);
				const tokennameRow = new ActionRowBuilder().addComponents(tokenname);
				const claimrateRow = new ActionRowBuilder().addComponents(claimrate);

				// Add inputs to the modal
				modal.addComponents(tokenaddressRow, tokennameRow, claimrateRow);

				// Show the modal to the user
				await interaction.showModal(modal);

		}
		else if(interaction.customId === 'rrdetailsbtn') {

			const modal = new ModalBuilder()
					.setCustomId('rrdetailsmodal')
					.setTitle('Get RR Details');

				const tokenaddress = new TextInputBuilder()
					.setCustomId('rrnameinput')
					.setLabel("RR Title")
					.setStyle(TextInputStyle.Short);

				const tokenaddressRow = new ActionRowBuilder().addComponents(tokenaddress);

				// Add inputs to the modal
				modal.addComponents(tokenaddressRow);

				// Show the modal to the user
				await interaction.showModal(modal);

		}else if(interaction.customId === 'rrleaderboardbtn'){
			const modal = new ModalBuilder()
					.setCustomId('rrleaderboardmodal')
					.setTitle('Get RR Details');

				const tokenaddress = new TextInputBuilder()
					.setCustomId('rrnameinput')
					.setLabel("RR Title")
					.setStyle(TextInputStyle.Short);

				const tokenaddressRow = new ActionRowBuilder().addComponents(tokenaddress);

				// Add inputs to the modal
				modal.addComponents(tokenaddressRow);

				// Show the modal to the user
				await interaction.showModal(modal);
		}else if(interaction.customId === 'addmissionbtn'){

			const choices = new SelectMenuBuilder()
								.setCustomId('missiontype')
								.setPlaceholder('Select mission type')

			choices.addOptions({
				label: 'Option 1',
				description: "Raid 2 Earn",
				value: 'r2e',
			})

			choices.addOptions({
				label: 'Option 2',
				description: "Tweet 2 Earn",
				value: 't2e',
			})
			
			const row = new ActionRowBuilder()
				.addComponents(
						choices
				);
					
				getProject(interaction.guild.id).then(async res => {
					let embed1 = null
					console.log(res , ' ******************')
					if(res == null){
						embed1 = embed()
					}else{
						embed1 = embed55(res)
					}

					await interaction.reply({ ephemeral: true, embeds: [embed1], components: [row]})
				})

		}else if(interaction.customId === 'registerbtn'){

			const row = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setLabel('Register Now!')
							.setURL("https://revengerz.xyz")
							.setStyle(ButtonStyle.Link))

							getProject(interaction.guild.id).then(async res => {
								let embed1 = null
								console.log(res , ' ******************')
								if(res == null){
									embed1 = embed()
								}else{
									embed1 = embed55(res)
								}
								embed1.setTitle('How to Register ?')
									.setThumbnail('https://cdn-icons-png.flaticon.com/512/5836/5836184.png')
									.setDescription('1- Head to https://revengerz.xyz\n'+
													'2- Connect you wallet\n'+
													'3- Go to your profile\n'+
													'4- Link your discord and twitter accounts')
								await interactionReply(embed1, interaction, row);
							})

		}else if(interaction.customId === 'leaderboardbtn'){

			var sql = "SELECT * from raiding_run where rr_name = '" + interaction.message.embeds[0].fields[0].value +"' and dc_id = '" + interaction.guild.id + "';";

			con.query(sql, async (err, result) => {
				if (err) {
					await interaction.deferReply({ ephemeral: true }).catch(err => {});
					sendErrorEmbed(interaction);
				}
				else{

					var sql = "SELECT * from raiding_run_user where rr_id = '" + result[0].rr_id +"' and dc_id = '" + interaction.guild.id + "' ORDER BY points DESC;";
					con.query(sql, async (err, result2) => {

						if (err) {
							await interaction.deferReply({ ephemeral: true }).catch(err => {});
							sendErrorEmbed(interaction);
						}
						else{
							try{
								getProject(interaction.guild.id).then(async res => {
									let embed1 = null
									console.log(res , ' ******************')
									if(res == null){
										embed1 = embed()
									}else{
										embed1 = embed55(res)
									}
									embed1.setTitle('RR Leaderboard')
										.setThumbnail('https://cdn-icons-png.flaticon.com/512/548/548481.png')


									const boo = new Promise((resolve, reject) => {
										if(result2.length == 0)
											resolve(true)

											
										result2.forEach((x, i, array) => {

											if(i <= 9)
											embed1.addFields({ name: 'Place N°'+ parseInt(i+1), value: "**" + x.username + "**" + " (*id: " + x.user_id + "*, **" + x.points + " Points** )" , inline: false })

											if(i == array.length - 1 || i == 9) {
												resolve(true)
											}
										})
									})
										boo.then(async () => {
											await interactionReply(embed1, interaction, null);
										})
								})
								}catch(err){
									await interaction.deferReply({ ephemeral: true }).catch(err => {});
									sendErrorEmbed(interaction);
								}
						}
					})
				}
			});
		}else if(interaction.customId === 'mypointsbtn'){

			var sql = "SELECT * from raiding_run where rr_name = '" + interaction.message.embeds[0].fields[0].value +"' and dc_id = '" + interaction.guild.id + "';";

			con.query(sql, async (err, result) => {
				if (err) {
					await interaction.deferReply({ ephemeral: true }).catch(err => {});
					sendErrorEmbed(interaction);
				}
				else{

					try{
						var sql = "SELECT * from raiding_run_user where rr_id = '" + result[0].rr_id +"' and dc_id = '" + interaction.guild.id + "' and user_id = '" + interaction.user.id+"';";
						con.query(sql, async (err, result2) => {

							getProject(interaction.guild.id).then(async res => {
								let embed1 = null
								console.log(res , ' ******************')
								if(res == null){
									embed1 = embed()
								}else{
									embed1 = embed55(res)
								}
								embed1.setTitle('My Points')
									.setThumbnail('https://cdn-icons-png.flaticon.com/512/548/548481.png')
									.addFields({ name: 'Raiding Run', value: result[0].rr_name , inline: false })
									.addFields({ name: 'Target Points For Reward', value: '**' + result[0].nb_points_to_winner + '**' , inline: false })
									.addFields({ name: 'Reward', value: '**' + result[0].reward + '**' , inline: false })

									if(result2.length == 0){
										embed1.addFields({ name: 'Your Points', value: "**0**" , inline: false })
									}else{
										embed1.addFields({ name: 'Your Points', value: "**" + result2[0].points + "**" , inline: false })
									}
									await interactionReply(embed1, interaction, null);
							})

							
						})
					}catch(err){
						await interaction.deferReply({ ephemeral: true }).catch(err => {});
						sendErrorEmbed(interaction);
					}
					
				}
			});
		}else if(interaction.customId === 'claimr2ebtn'){
			await interaction.deferReply({ ephemeral: true }).catch(err => {});
			try{
				var sql = "SELECT * FROM users where dcid = '" + interaction.user.id + "' and twid is not null" ;

				con.query(sql, async (err, result) => {
					if (err) {
						await interaction.deferReply({ ephemeral: true }).catch(err => {});
						sendErrorEmbed(interaction);
					}
					else{

						if(result.length == 0){

							const row = new ActionRowBuilder()
									.addComponents(
										new ButtonBuilder()
											.setLabel('Register Now!')
											.setURL("https://revengerz.xyz")
											.setStyle(ButtonStyle.Link))
							getProject(interaction.guild.id).then(async res => {
												let embed1 = null
												console.log(res , ' ******************')
												if(res == null){
													embed1 = embed()
												}else{
													embed1 = embed55(res)
												}
												embed1.setTitle('You Are Not Registered!')
													.setThumbnail('https://cdn-icons-png.flaticon.com/512/5836/5836184.png')
													.setDescription('1- Head to https://revengerz.xyz\n'+
																	'2- Connect you wallet\n'+
																	'3- Go to your profile\n'+
																	'4- Link your discord and twitter accounts')
											await interactionReply(embed1, interaction, row);
											})
						}else{
								var sql = "SELECT * from raiding_run where rr_name = '" + interaction.message.embeds[0].fields[0].value +"' and dc_id = '" + interaction.guild.id + "';";
								console.log(sql)
								con.query(sql, async (err, result2) => {
									if (err) {
										await interaction.deferReply({ ephemeral: true }).catch(err => {});
										sendErrorEmbed(interaction);
									}
									else{
										if(result2[0].finished == 1){
											getProject(interaction.guild.id).then(async res => {
												let embed1 = null
												console.log(res , ' ******************')
												if(res == null){
													embed1 = embed()
												}else{
													embed1 = embed55(res)
												}
											embed1.setTitle('Sorry, but this Raiding Run is already finished!')
											await interactionReply(embed1, interaction, null);
											})
										}else{
										
											sql = "SELECT * from user_claim where rr_id = '" + result2[0].rr_id +"' and dc_id = '" + interaction.guild.id + 
													"' and raid_link = '" + interaction.message.embeds[0].fields[4].value + "' and user_id = '" + interaction.user.id + "';";

											con.query(sql, async (err, result4) => {
												if (err) {
													await interaction.deferReply({ ephemeral: true }).catch(err => {});
													sendErrorEmbed(interaction);
												}
												else{
													// See if empty or check the unclaimed ones
														var likesClaimed = 0
														var likeFound = 0
														var commentsClaimed = 0
														var commentFound = 0
														var retweetClaimed = 0
														var retweetFound = 0 

														// Check like
														if(parseInt(interaction.message.embeds[0].fields[5].value) != 0){
															var xmlHttp = new XMLHttpRequest();
															const url = "https://api.twitter.com/2/tweets/"+interaction.message.embeds[0].fields[4].value.split('/')[5].split('?')[0]+"/liking_users";
															var initialArray = null;
															xmlHttp.open( "GET", url ); // false for synchronous request
															xmlHttp.setRequestHeader("Authorization", "Bearer AAAAAAAAAAAAAAAAAAAAAFjJkwEAAAAAlZKCY9f%2FX%2B2aKqYn1Ha5TUtPvok%3Dc5CTN8zI6uuuhg7XG3i2uUpDSV5edhdDmTYhJnUf5GE3cidyvS");
															
															xmlHttp.send();

															//****************** Likes ***********************/
															xmlHttp.addEventListener("load", function() {
																console.log(result[0].twid , ' ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
																initialArray = JSON.parse(xmlHttp.response);
																var i = 0;
																if(initialArray.data){
																	while(likeFound == 0 && i<initialArray.data.length){
																		if(initialArray.data[i].id === result[0].twid)
																			likeFound = 1;
																		i++;
																	}
																	if(likeFound == 1){																		
																		likesClaimed = likesClaimed + parseFloat(interaction.message.embeds[0].fields[5].value.replace('**', ''))
																	}
																}

																/******************************************* Retweets ************************************************/
																xmlHttp = new XMLHttpRequest();
																const url = "https://api.twitter.com/2/tweets/"+interaction.message.embeds[0].fields[4].value.split('/')[5].split('?')[0]+"/retweeted_by";
																
																xmlHttp.open( "GET", url ); // false for synchronous request
																xmlHttp.setRequestHeader("Authorization", "Bearer AAAAAAAAAAAAAAAAAAAAAFjJkwEAAAAAlZKCY9f%2FX%2B2aKqYn1Ha5TUtPvok%3Dc5CTN8zI6uuuhg7XG3i2uUpDSV5edhdDmTYhJnUf5GE3cidyvS");
																
																xmlHttp.send();

																xmlHttp.addEventListener("load", async function() {

																	initialArray = JSON.parse(xmlHttp.response);
																	var i = 0;
																	if(initialArray.data){
																		while(retweetFound == 0 && i<initialArray.data.length){
																			if(initialArray.data[i].id === result[0].twid)
																				retweetFound = 1;
																			i++;
																		}
																		if(retweetFound == 1){
																			retweetClaimed = retweetClaimed + parseFloat(interaction.message.embeds[0].fields[7].value.replace('**', ''))
																		}
																	}

																	const isCommented = await checkUserComment(interaction.message.embeds[0].fields[4].value.split('/')[5].split('?')[0]
																		, result[0].twid)
																	if(isCommented){
																		commentFound = 1
																		commentsClaimed = commentsClaimed + parseFloat(interaction.message.embeds[0].fields[6].value.replace('**', ''))
																	}
																	
																	
																	if(result4.length != 0){
																		if(result4[0].like_claimed == 1){
																			likesClaimed = 0
																			likeFound = 1
																		}if(result4[0].comment_claimed == 1){
																			commentsClaimed = 0
																			commentFound = 1
																		}if(result4[0].retweet_claimed == 1){
																			retweetClaimed = 0
																			retweetFound = 1
																		}
																	}else{

																	}
																	
																	var total = likesClaimed + commentsClaimed + retweetClaimed

																		sql = "SELECT * FROM raiding_run_user where rr_id = '" + result2[0].rr_id + "' and user_id = '" + interaction.user.id + "'"

																		con.query(sql, async (err, result7) => {
																			if (err) {
																				await interaction.deferReply({ ephemeral: true }).catch(err => {});
																				sendErrorEmbed(interaction);
																			}else{

																				if(result7.length == 0){
																					sql = "INSERT INTO raiding_run_user(user_id, rr_id, dc_id, points, username) VALUES ('" + interaction.user.id +"', '" + result2[0].rr_id + "', '"+
																						interaction.guild.id + "', " + total + ", '" + interaction.user.username + "')"
																				}else{
																					var pp = result7[0].points + total
																					total = pp
																					sql = "UPDATE raiding_run_user SET points = " + pp + " where id = " + result7[0].id + ";"
																				}																	
																					con.query(sql, async (err, result5) => {
																						if (err) {
																							await interaction.deferReply({ ephemeral: true }).catch(err => {});
																							sendErrorEmbed(interaction);
																						}else{

																							if(result4.length == 0){

																								sql = "INSERT INTO user_claim(raid_link, rr_id, dc_id, user_id, like_claimed, comment_claimed, retweet_claimed) VALUES ('" + interaction.message.embeds[0].fields[4].value +"', '" 
																													+ result2[0].rr_id + "', '"+ interaction.guild.id + "', " + interaction.user.id + ", " + likeFound + ", " + commentFound + ", " + retweetFound + " )"
																							}else{
																								sql = "UPDATE user_claim SET like_claimed = " + likeFound + ", comment_claimed = " + commentFound + ", retweet_claimed = " + retweetFound + " where claim_id = " + result4[0].claim_id 
																							}
																							con.query(sql, async (err, result5) => {
																										if (err) {
																											await interaction.deferReply({ ephemeral: true }).catch(err => {});
																											sendErrorEmbed(interaction);
																										}else{
																											
																											if(result2[0].nb_points_to_winner <= total){
																												sql = "UPDATE raiding_run SET finished = 1 where rr_name = '" + result2[0].rr_name + "';"
																												con.query(sql, async (err, result5) => {
																													if (err) {
																														await interaction.deferReply({ ephemeral: true }).catch(err => {});
																														sendErrorEmbed(interaction);
																													}else{
																														
																													}
																												})
																											} 

																											try{
																												getProject(interaction.guild.id).then(async res => {
																													let embed1 = null
																													console.log(res , ' ******************')
																													if(res == null){
																														embed1 = embed()
																													}else{
																														embed1 = embed55(res)
																													}
																													embed1.setTitle('R2E Claim')
																														.setThumbnail('https://cdn-icons-png.flaticon.com/512/9922/9922496.png')
																														.addFields({ name: 'RR Name', value: interaction.message.embeds[0].fields[0].value , inline: false })
																														.addFields({ name: 'RR Reward', value: interaction.message.embeds[0].fields[1].value , inline: false })
																														.addFields({ name: 'Total Points Target', value: interaction.message.embeds[0].fields[2].value , inline: false })
																														.addFields({ name: 'Your Points', value: "**" + total + "**" , inline: false })
																														.addFields({ name: 'Like Points Claimed', value: "*" + likesClaimed + " Points*" , inline: false })
																														.addFields({ name: 'Comment Points Claimed', value: "*" + commentsClaimed + " Points*" , inline: false })
																														.addFields({ name: 'Retweet Points Claimed', value: "*" + retweetClaimed + " Points*" , inline: false })
																														await interactionReply(embed1, interaction, null);
																													})
																												}catch(err){
																													await interaction.deferReply({ ephemeral: true }).catch(err => {});
																													sendErrorEmbed(interaction);
																											}
																										}
																								})
																							
																						}
																					})
																			}
																		})
																})
															})
														}
												}
											})

										}
									}
								})
						}
					}
				})
			}catch(error){
				sendErrorEmbed(interaction)
			}
		}else if(interaction.customId === 'claimt2ebtn'){
			await interaction.deferReply({ ephemeral: true }).catch(err => {});
			try{
				var sql = "SELECT * FROM users where dcid = '" + interaction.user.id + "'" ;

				con.query(sql, async (err, result) => {
					if (err) {

						await interaction.deferReply({ ephemeral: true }).catch(err => {});
						sendErrorEmbed(interaction);
					}
					else{

						if(result.length == 0){

							const row = new ActionRowBuilder()
									.addComponents(
										new ButtonBuilder()
											.setLabel('Register Now!')
											.setURL("https://revengerz.xyz")
											.setStyle(ButtonStyle.Link))
							getProject(interaction.guild.id).then(async res => {
												let embed1 = null
												console.log(res , ' ******************')
												if(res == null){
													embed1 = embed()
												}else{
													embed1 = embed55(res)
												}
								embed1.setTitle('You Are Not Registered!')
									.setThumbnail('https://cdn-icons-png.flaticon.com/512/5836/5836184.png')
									.setDescription('1- Head to https://revengerz.xyz\n'+
													'2- Connect you wallet\n'+
													'3- Go to your profile\n'+
													'4- Link your discord and twitter accounts')
								await interactionReply(embed1, interaction, row);
							})
						}else{
								var sql = "SELECT * from raiding_run where rr_name = '" + interaction.message.embeds[0].fields[0].value +"' and dc_id = '" + interaction.guild.id + "';";

								con.query(sql, async (err, result2) => {
									if (err) {
										await interaction.deferReply({ ephemeral: true }).catch(err => {});
										sendErrorEmbed(interaction);
									}
									else{
										if(result2[0].finished == 1){
											getProject(interaction.guild.id).then(async res => {
												let embed1 = null
												console.log(res , ' ******************')
												if(res == null){
													embed1 = embed()
												}else{
													embed1 = embed55(res)
												}
											embed1.setTitle('Sorry, but this Raiding Run is already finished!')
											await interactionReply(embed1, interaction, null);
											})
										}else{
											
											// Get mission id
											var sql = "SELECT * from rr_mission where rr_id = '" + result2[0].rr_id +"' and dc_id = '" + interaction.guild.id + "' and t2e_name = '" + interaction.message.embeds[0].fields[7].value + "';";
											
											con.query(sql, async (err, result3) => {
												if (err) {
													await interaction.deferReply({ ephemeral: true }).catch(err => {});
													sendErrorEmbed(interaction);
												}
												else{
													sql = "SELECT * from user_claim where rr_id = '" + result2[0].rr_id +"' and dc_id = '" + interaction.guild.id + 
													"' and t2e_name = '" + result3[0].t2e_name + "' and user_id = '" + interaction.user.id + "';";

													con.query(sql, async (err, result4) => {
														if (err) {
															await interaction.deferReply({ ephemeral: true }).catch(err => {});
															sendErrorEmbed(interaction);
														}
														else{
															// See if empty or check the unclaimed ones
																var textFound = 0
																var hashFound = 0
																var initialArray = null;
																
																	var xmlHttp = new XMLHttpRequest();
																	const url = "https://api.twitter.com/2/users/" + result[0].twid + "/tweets?exclude=retweets,replies&max_results=100";
																	xmlHttp.open( "GET", url ); // false for synchronous request
																	xmlHttp.setRequestHeader("Authorization", "Bearer AAAAAAAAAAAAAAAAAAAAAFjJkwEAAAAAlZKCY9f%2FX%2B2aKqYn1Ha5TUtPvok%3Dc5CTN8zI6uuuhg7XG3i2uUpDSV5edhdDmTYhJnUf5GE3cidyvS");
																	
																	xmlHttp.send();

																	xmlHttp.addEventListener("load", async function() {
																		initialArray = JSON.parse(xmlHttp.response);
																		var found = 0;
																		var t2eClaimed = 0
																		var total = 0
																		var i = 0;
																		var txt = interaction.message.embeds[0].fields[4].value.split(',');
																		var hashs = interaction.message.embeds[0].fields[5].value.split(',');

																		if(initialArray.data){
																			while(found == 0 && i<initialArray.data.length){
																				textFound = 1;
																				hashFound = 1;
																				for(var j=0; j<txt.length; j++){
																					if(!initialArray.data[i].text.includes(txt[j]))
																						textFound = 0;
																				}
																				for(var j=0; j<hashs.length; j++){
																					if(!initialArray.data[i].text.includes(hashs[j]))
																						hashFound = 0;
																				}	
							
																				
																				if(textFound && hashFound)
																				{
																					found = 1;
																					t2eClaimed = t2eClaimed = parseFloat(interaction.message.embeds[0].fields[6].value.replace('**', ''))
																					total = t2eClaimed
																				}
																					
																				i++;
																			}

																			if(found == 1){
																				if(result4.length != 0){
																					if(result4[0].t2e_claimed == 1){
																						t2eClaimed = 0
																						found = 1
																					}
																				}

																				sql = "SELECT * FROM raiding_run_user where rr_id = '" + result2[0].rr_id + "' and user_id = '" + interaction.user.id + "'"

																				con.query(sql, async (err, result7) => {
																					if (err) {
																						await interaction.deferReply({ ephemeral: true }).catch(err => {});
																						sendErrorEmbed(interaction);
																					}else{

																						if(result7.length == 0){
																							sql = "INSERT INTO raiding_run_user(user_id, rr_id, dc_id, points, username) VALUES ('" + interaction.user.id +"', '" + result2[0].rr_id + "', '"+
																								interaction.guild.id + "', " + t2eClaimed + ", '" + interaction.user.username + "')"
																						}else{
																							var pp = result7[0].points + t2eClaimed
																							total = pp
																							sql = "UPDATE raiding_run_user SET points = " + pp + " where id = " + result7[0].id + ";"
																						}																	
																							con.query(sql, async (err, result5) => {
																								if (err) {
																									await interaction.deferReply({ ephemeral: true }).catch(err => {});
																									sendErrorEmbed(interaction);
																								}else{

																									if(result4.length == 0){

																										sql = "INSERT INTO user_claim(t2e_name, rr_id, dc_id, user_id, t2e_claimed) VALUES ('" + interaction.message.embeds[0].fields[7].value +"', '" 
																															+ result2[0].rr_id + "', '"+ interaction.guild.id + "', " + interaction.user.id + ", " + found + " )"
																									}else{
																										sql = "UPDATE user_claim SET t2e_claimed = " + found + " where claim_id = " + result4[0].claim_id 
																									}
																									con.query(sql, async (err, result5) => {
																												if (err) {
																													await interaction.deferReply({ ephemeral: true }).catch(err => {});
																													sendErrorEmbed(interaction);
																												}else{
																													
																													if(result2[0].nb_points_to_winner <= total){
																														sql = "UPDATE raiding_run SET finished = 1 where rr_name = '" + result2[0].rr_name + "';"
																														con.query(sql, async (err, result5) => {
																															if (err) {
																																await interaction.deferReply({ ephemeral: true }).catch(err => {});
																																sendErrorEmbed(interaction);
																															}else{
																																
																															}
																														})
																													} 

																													try{
																														getProject(interaction.guild.id).then(async res => {
																															let embed1 = null
																															console.log(res , ' ******************')
																															if(res == null){
																																embed1 = embed()
																															}else{
																																embed1 = embed55(res)
																															}
																														embed1.setTitle('T2E Claim')
																															.setThumbnail('https://cdn-icons-png.flaticon.com/512/2580/2580225.png')
																															.addFields({ name: 'RR Name', value: interaction.message.embeds[0].fields[0].value , inline: false })
																															.addFields({ name: 'RR Reward', value: interaction.message.embeds[0].fields[1].value , inline: false })
																															.addFields({ name: 'Total Points Target', value: interaction.message.embeds[0].fields[2].value , inline: false })
																															.addFields({ name: 'Your Points', value: "**" + total + "**" , inline: false })
																															.addFields({ name: 'T2E Points Claimed', value: "*" + t2eClaimed + " Points*" , inline: false })
																															await interactionReply(embed1, interaction, null);
																														})
																														}catch(err){
																															await interaction.deferReply({ ephemeral: true }).catch(err => {});
																															sendErrorEmbed(interaction);
																													}
																												}
																										})
																									
																								}
																							})
																					}
																				})
																			}else{
																				getProject(interaction.guild.id).then(async res => {
																					let embed1 = null
																					console.log(res , ' ******************')
																					if(res == null){
																						embed1 = embed()
																					}else{
																						embed1 = embed55(res)
																					}
																				embed1.setTitle('T2E Claim')
																					.setThumbnail('https://cdn-icons-png.flaticon.com/512/2580/2580225.png')
																					.addFields({ name: 'RR Name', value: interaction.message.embeds[0].fields[0].value , inline: false })
																					.addFields({ name: 'RR Reward', value: interaction.message.embeds[0].fields[1].value , inline: false })
																					.addFields({ name: 'Total Points Target', value: interaction.message.embeds[0].fields[2].value , inline: false })
																					.addFields({ name: 'T2E Points Claimed', value: "*" + t2eClaimed + " Points*" , inline: false })
																				await interactionReply(embed1, interaction, null);
																				})
																			}
																		}
																	})
														}
													})
												}
											})

											// Get users claims
											

										}
									}
								})
						}
					}
				})
			}catch(error){
				sendErrorEmbed(interaction)
			}
		}
	}
	else if (interaction.isModalSubmit()) {
		await interaction.deferReply({ ephemeral: true }).catch(err => {});
		if (interaction.customId === 'createrrmodal') {

			var sql = "INSERT INTO raiding_run (dc_id, rr_name, reward, nb_points_to_winner) " + 
						"VALUES ('" + interaction.guild.id + "', '"+ interaction.fields.getTextInputValue('rrnameinput') 
						+"', '"+ interaction.fields.getTextInputValue('rrrewardinput') + "', '"+ interaction.fields.getTextInputValue('nbpointsinput') + "')";

			con.query(sql, async (err, result) => {
				if (err) {
					await interaction.deferReply({ ephemeral: true }).catch(err => {});
					sendErrorEmbed(interaction);
				}
				else{

					var sql = "SELECT * FROM rr_subs where dc_id = '" + interaction.guild.id + "'";

					con.query(sql, async (err, result2) => {
						if (err) {
							await interaction.deferReply({ ephemeral: true }).catch(err => {});
							sendErrorEmbed(interaction);
						}else{
							if(result2.length != 0){
								var consumed = result2[0].consumed + 1
								
								var sql = "UPDATE rr_subs set consumed = " + consumed + " where dc_id = '" + interaction.guild.id + "'";

								con.query(sql, async (err, result2) => {
									if (err) {
										await interaction.deferReply({ ephemeral: true }).catch(err => {});
										sendErrorEmbed(interaction);
									}else{
										try{
											getProject(interaction.guild.id).then(async res => {
												let embed1 = null
												console.log(res , ' ******************')
												if(res == null){
													embed1 = embed()
												}else{
													embed1 = embed55(res)
												}
											embed1.setTitle('RR Creation')
												.setThumbnail('https://cdn-icons-png.flaticon.com/512/753/753317.png')
												.setDescription('Your RR is created with success!')
												.addFields({ name: 'RR Name', value: interaction.fields.getTextInputValue('rrnameinput') , inline: false })
												.addFields({ name: 'RR Reward', value: interaction.fields.getTextInputValue('rrrewardinput') , inline: false })
												.addFields({ name: 'Total Points Target', value: interaction.fields.getTextInputValue('nbpointsinput') , inline: false })
												await interactionReply(embed1, interaction, null);
											})
											}catch(err){
												await interaction.deferReply({ ephemeral: true }).catch(err => {});
												sendErrorEmbed(interaction);
											}
									}
								})

							}
						}
					})

					
				}
			});

			/*clientPg.query("SELECT * FROM bankconfig where dcid = '" + interaction.guild.id + "'").then(async res => {
				const data5 = res.rows;
				if(data5.length == 0)
				{
					// insert 
					const res = insetConfig(interaction.guild.id,
											interaction.fields.getTextInputValue('tokenaddinput'),
											interaction.fields.getTextInputValue('tokennameinput'),
											interaction.fields.getTextInputValue('claiminput'),
											interaction.fields.getTextInputValue('dailyrewardsinput'),
											interaction.fields.getTextInputValue('bankimageinput'))
					if(res)
					{
						try{
						let embed1 = embed()
						embed1.setTitle('Bank Configuration')
							.setDescription('Your bank has been configured with success')
							.addFields({ name: 'Token Address', value: interaction.fields.getTextInputValue('tokenaddinput') , inline: false })
							.addFields({ name: 'Token Name', value: interaction.fields.getTextInputValue('tokennameinput') , inline: false })
							.addFields({ name: 'Minimum to Claim', value: interaction.fields.getTextInputValue('claiminput') , inline: false })
							.addFields({ name: 'Daily rewards', value: interaction.fields.getTextInputValue('dailyrewardsinput') , inline: false })
							await interactionReply(embed1, interaction, null);
						}catch(err){
							await interaction.deferReply({ ephemeral: true }).catch(err => {});
							sendErrorEmbed(interaction);
						}
					}
					else{
						
					}
				}
				else{
					// update
					try{
					const res = updateConfig(interaction.guild.id,
						interaction.fields.getTextInputValue('tokenaddinput'),
						interaction.fields.getTextInputValue('tokennameinput'),
						interaction.fields.getTextInputValue('claiminput'),
						interaction.fields.getTextInputValue('dailyrewardsinput'),
						interaction.fields.getTextInputValue('bankimageinput'))

						let embed1 = embed()
						embed1.setTitle('Bank Configuration')
							.setDescription('Your bank has been configured with success')
							.addFields({ name: 'Token Address', value: interaction.fields.getTextInputValue('tokenaddinput') , inline: false })
							.addFields({ name: 'Token Name', value: interaction.fields.getTextInputValue('tokennameinput') , inline: false })
							.addFields({ name: 'Minimum to Claim', value: interaction.fields.getTextInputValue('claiminput') , inline: false })
							.addFields({ name: 'Daily rewards', value: interaction.fields.getTextInputValue('dailyrewardsinput') , inline: false })
							await interactionReply(embed1, interaction, null);
						}catch(err){
							await interaction.deferReply({ ephemeral: true }).catch(err => {});
							sendErrorEmbed(interaction);
						}
				}
			}).finally(() => {

			})*/
		}else if (interaction.customId === 'rrdetailsmodal') {
			var sql = "SELECT * from raiding_run where rr_name = '" + interaction.fields.getTextInputValue('rrnameinput') +"' and dc_id = '" + interaction.guild.id + "';";

			con.query(sql, async (err, result) => {
				if (err) {
					await interaction.deferReply({ ephemeral: true }).catch(err => {});
					sendErrorEmbed(interaction);
				}
				else{
					var sql = "SELECT count(rr_id) from rr_mission where rr_id = '" + result[0].rr_id +"';";
					con.query(sql, async (err, result2) => {

						if (err) {
							await interaction.deferReply({ ephemeral: true }).catch(err => {});
							sendErrorEmbed(interaction);
						}
						else{
							try{
								var stat = "Finished"

								if(result[0].finished == 0)
									stat = "Running"

									getProject(interaction.guild.id).then(async res => {
										let embed1 = null
										console.log(res , ' ******************')
										if(res == null){
											embed1 = embed()
										}else{
											embed1 = embed55(res)
										}
										embed1.setTitle('RR Details')
											.setThumbnail('https://cdn-icons-png.flaticon.com/512/2538/2538026.png')
											.addFields({ name: 'RR Name', value: result[0].rr_name , inline: false })
											.addFields({ name: 'RR Reward', value: result[0].reward , inline: false })
											.addFields({ name: 'Total Points Target', value: '**'+result[0].nb_points_to_winner+'**' , inline: false })
											.addFields({ name: 'Status', value: stat , inline: false })
											.addFields({ name: 'Raiding Mission in this RR', value: '**'+result2[0]['count(rr_id)']+'**' , inline: false })
											await interactionReply(embed1, interaction, null);
									})
								}catch(err){
									await interaction.deferReply({ ephemeral: true }).catch(err => {});
									sendErrorEmbed(interaction);
								}
						}
					})
				}
			});
		}else if (interaction.customId === 'rrleaderboardmodal') {
			var sql = "SELECT * from raiding_run where rr_name = '" + interaction.fields.getTextInputValue('rrnameinput') +"' and dc_id = '" + interaction.guild.id + "';";

			con.query(sql, async (err, result) => {
				if (err) {
					await interaction.deferReply({ ephemeral: true }).catch(err => {});
					sendErrorEmbed(interaction);
				}
				else{

					var sql = "SELECT * from raiding_run_user where rr_id = '" + result[0].rr_id +"' and dc_id = '" + interaction.guild.id + "' ORDER BY points DESC;";
					con.query(sql, async (err, result2) => {

						if (err) {
							await interaction.deferReply({ ephemeral: true }).catch(err => {});
							sendErrorEmbed(interaction);
						}
						else{
							try{
								getProject(interaction.guild.id).then(async res => {
									let embed1 = null
									console.log(res , ' ******************')
									if(res == null){
										embed1 = embed()
									}else{
										embed1 = embed55(res)
									}
								embed1.setTitle('RR Leaderboard')
									.setThumbnail('https://cdn-icons-png.flaticon.com/512/548/548481.png')


								const boo = new Promise((resolve, reject) => {
									if(result2.length == 0)
										resolve(true)
									result2.forEach((x, i, array) => {

										if(i <= 9)
											embed1.addFields({ name: 'Place N°'+ parseInt(i+1), value: "**" + x.username + "**" + " (*id: " + x.user_id + "*, **" + x.points + " Points** )" , inline: false })

										if(i == array.length - 1 || i == 9) resolve(true)
									})
								})
									boo.then(async () => {
										await interactionReply(embed1, interaction, null);
									})
								})
								}catch(err){
									await interaction.deferReply({ ephemeral: true }).catch(err => {});
									sendErrorEmbed(interaction);
								}
						}
					})
				}
			});
		}else if (interaction.customId === 'r2emodal') { 

			var sql = "SELECT * from raiding_run where rr_name = '" + interaction.fields.getTextInputValue('rrnameinput') +"' and dc_id = '" + interaction.guild.id + "';";

			con.query(sql, async (err, result) => {
				if(result[0].finished == 1){
					getProject(interaction.guild.id).then(async res => {
						let embed1 = null
						console.log(res , ' ******************')
						if(res == null){
							embed1 = embed()
						}else{
							embed1 = embed55(res)
						}
					embed1.setTitle('Add R2E Mission')
							.setDescription('The Raiding Run you choosed is already finished!')
					await interactionReply(embed1, interaction, null);		
					})
				}else{
					var r2e = "r2e"
					var t2e = "t2e"
					var sql = "INSERT INTO rr_mission (dc_id, rr_id, type, points_per_like, points_per_comment, points_per_retweet, raid_link) " + 
						"VALUES ('" + interaction.guild.id + "', '"+ result[0].rr_id + "', '" + r2e + "'"+
						", " + interaction.fields.getTextInputValue('r2elikeinput') + ", "+ interaction.fields.getTextInputValue('r2ecommentinput') +
						", " + interaction.fields.getTextInputValue('r2eretweetinput') + ", '"+ interaction.fields.getTextInputValue('r2elinkinput') +"')";

					con.query(sql, async (err, result) => {
						if (err) {
							await interaction.deferReply({ ephemeral: true }).catch(err => {});
							sendErrorEmbed(interaction);
						}else{

							getProject(interaction.guild.id).then(async res => {
								let embed1 = null
								console.log(res , ' ******************')
								if(res == null){
									embed1 = embed()
								}else{
									embed1 = embed55(res)
								}
								embed1.setTitle('Add R2E Mission')
									.setThumbnail('https://cdn-icons-png.flaticon.com/512/2538/2538026.png')
									.addFields({ name: 'Raid Link', value: interaction.fields.getTextInputValue('r2elinkinput') , inline: false })
									.addFields({ name: 'Points Per Like', value: "**" + interaction.fields.getTextInputValue('r2elikeinput') + "**" , inline: false })
									.addFields({ name: 'Points Per Comment', value: "**" + interaction.fields.getTextInputValue('r2ecommentinput') + "**" , inline: false })
									.addFields({ name: 'Points Per Retweet', value: "**" + interaction.fields.getTextInputValue('r2eretweetinput') + "**" , inline: false })
									.addFields({ name: 'Post To Community', value: codeBlock('yaml', "!raid " + interaction.fields.getTextInputValue('r2elinkinput')) , inline: false })
									await interactionReply(embed1, interaction, null);
							})

						}
					})
				}
			})

		}else if (interaction.customId === 't2emodal') { 
			var sql = "SELECT * from raiding_run where rr_name = '" + interaction.fields.getTextInputValue('rrnameinput') +"' and dc_id = '" + interaction.guild.id + "';";

			con.query(sql, async (err, result) => {
				if(result[0].finished == 1){
					getProject(interaction.guild.id).then(async res => {
						let embed1 = null
						console.log(res , ' ******************')
						if(res == null){
							embed1 = embed()
						}else{
							embed1 = embed55(res)
						}
					embed1.setTitle('Add T2E Mission')
							.setDescription('The Raiding Run you choosed is already finished!')
					await interactionReply(embed1, interaction, null);	
					})	

				}else{
					var r2e = "r2e"
					var t2e = "t2e"
					var sql = "INSERT INTO rr_mission (dc_id, rr_id, type, words_must_include, hashtags_must_include, points_per_t2e, t2e_name) " + 
						"VALUES ('" + interaction.guild.id + "', '"+ result[0].rr_id + "', '" + t2e + "'"+
						", '" + interaction.fields.getTextInputValue('t2ewordsinput') + "', '"+ interaction.fields.getTextInputValue('t2ehashinput') +
						"', " + interaction.fields.getTextInputValue('t2epointsinput') +", '" + interaction.fields.getTextInputValue('t2enameinput') +"')";

					con.query(sql, async (err, result) => {
						if (err) {
							await interaction.deferReply({ ephemeral: true }).catch(err => {});
							sendErrorEmbed(interaction);
						}else{

							getProject(interaction.guild.id).then(async res => {
								let embed1 = null
								console.log(res , ' ******************')
								if(res == null){
									embed1 = embed()
								}else{
									embed1 = embed55(res)
								}
								embed1.setTitle('Add T2E Mission')
									.setThumbnail('https://cdn-icons-png.flaticon.com/512/2538/2538026.png')
									.addFields({ name: 'Must Include Words ', value: "**" + interaction.fields.getTextInputValue('t2ewordsinput') + "**" , inline: false })
									.addFields({ name: 'Must Include Hashtags ', value: "**" + interaction.fields.getTextInputValue('t2ehashinput') + "**" , inline: false })
									.addFields({ name: 'Points Per T2E', value: "**" + interaction.fields.getTextInputValue('t2epointsinput') + "**" , inline: false })
									.addFields({ name: 'Post To Community', value: codeBlock('yaml', "!t2e " + interaction.fields.getTextInputValue('t2enameinput')) , inline: false })
									await interactionReply(embed1, interaction, null);
							})

						}
					})
				}
			})
		}

	} 
	else if(interaction.isSelectMenu()) {
		if(interaction.customId === "missiontype"){
			if(interaction.values[0] === "r2e"){

				const modal = new ModalBuilder()
				.setCustomId('r2emodal')
				.setTitle('Add R2E Mission');

				const tokenaddress = new TextInputBuilder()
					.setCustomId('rrnameinput')
					.setLabel("RR Title")
					.setStyle(TextInputStyle.Short);

				const tokenaddress1 = new TextInputBuilder()
					.setCustomId('r2elinkinput')
					.setLabel("R2E Link")
					.setStyle(TextInputStyle.Short);

				const tokenaddress2 = new TextInputBuilder()
					.setCustomId('r2elikeinput')
					.setLabel("R2E Like Points")
					.setStyle(TextInputStyle.Short);

				const tokenaddress3 = new TextInputBuilder()
					.setCustomId('r2ecommentinput')
					.setLabel("R2E Comment Points")
					.setStyle(TextInputStyle.Short);
				
				const tokenaddress4 = new TextInputBuilder()
					.setCustomId('r2eretweetinput')
					.setLabel("R2E Retweet Points")
					.setStyle(TextInputStyle.Short);

				const tokenaddressRow = new ActionRowBuilder().addComponents(tokenaddress);
				const tokenaddressRow1 = new ActionRowBuilder().addComponents(tokenaddress1)
				const tokenaddressRow2 = new ActionRowBuilder().addComponents(tokenaddress2)
				const tokenaddressRow3 = new ActionRowBuilder().addComponents(tokenaddress3)
				const tokenaddressRow4 = new ActionRowBuilder().addComponents(tokenaddress4)

				// Add inputs to the modal
				modal.addComponents(tokenaddressRow, tokenaddressRow1, tokenaddressRow2, tokenaddressRow3, tokenaddressRow4);

				// Show the modal to the user
				await interaction.showModal(modal);

			}else if(interaction.values[0] === "t2e"){
				const modal = new ModalBuilder()
				.setCustomId('t2emodal')
				.setTitle('Add T2E Mission');

				const tokenaddress = new TextInputBuilder()
					.setCustomId('rrnameinput')
					.setLabel("RR Title")
					.setStyle(TextInputStyle.Short);

				const t2eName = new TextInputBuilder()
					.setCustomId('t2enameinput')
					.setLabel("T2E Name (used to post to community)")
					.setStyle(TextInputStyle.Short);
				
				const tokenaddress1 = new TextInputBuilder()
					.setCustomId('t2ewordsinput')
					.setLabel("Must Include Words (Comma separated)")
					.setStyle(TextInputStyle.Paragraph);

				const tokenaddress2 = new TextInputBuilder()
					.setCustomId('t2ehashinput')
					.setLabel("Must Include Hashtags (Comma separated)")
					.setStyle(TextInputStyle.Paragraph);

				const tokenaddress3 = new TextInputBuilder()
					.setCustomId('t2epointsinput')
					.setLabel("Reward Points")
					.setStyle(TextInputStyle.Short);

				const tokenaddressRow = new ActionRowBuilder().addComponents(tokenaddress);
				const tokenaddressRowX = new ActionRowBuilder().addComponents(t2eName);
				const tokenaddressRow1 = new ActionRowBuilder().addComponents(tokenaddress1)
				const tokenaddressRow2 = new ActionRowBuilder().addComponents(tokenaddress2)
				const tokenaddressRow3 = new ActionRowBuilder().addComponents(tokenaddress3)

				// Add inputs to the modal
				modal.addComponents(tokenaddressRow, tokenaddressRowX, tokenaddressRow1, tokenaddressRow2, tokenaddressRow3);

				// Show the modal to the user
				await interaction.showModal(modal);
			}
		}
	}
});

client.on('guildCreate', async (guild) => {

	let role = guild.roles.cache.find(role => role.name === "RZ Boss");

	if(role === undefined)
	{
		await guild.roles.create({
			name: 'RZ Boss',
			color: '#40444a',
			reason: 'RZ Boss Role',
		  })
			.then(async role => {
				let owner = await guild.fetchOwner()
				owner.roles.add(role);
			})
			.catch(console.error);
	}
 

});

client.on('messageCreate', async msg =>{
	let member = msg.guild.members.cache.get(msg.author.id)
	let hasRole = member.roles.cache.some(role => role.name === 'RZ Boss')
	if(msg.content.includes('!raid')){
		if(hasRole){
			var sql = "SELECT * from rr_mission where raid_link = '" + msg.content.replace('!raid ','') +"' and dc_id = '" + msg.guild.id + "';";

			con.query(sql, async (err, result) => {
				if (err) {
					msg.delete()
					sendErrorMsg(msg);
				}
				else{
					var sql = "SELECT * from raiding_run where rr_id = '" + result[0].rr_id +"';";
					con.query(sql, async (err, result2) => {

						if (err) {
							msg.delete()
							sendErrorMsg(msg);
						}
						else{
							try{
								var stat = "Finished"

								if(result2[0].finished == 0)
									stat = "Running"

									getProject(msg.guild.id).then(async res => {
										let embed1 = null
										console.log(res , ' ******************')
										if(res == null){
											embed1 = embed()
										}else{
											embed1 = embed55(res)
										}
										embed1.setTitle('R2E Mission')
											.setThumbnail('https://cdn-icons-png.flaticon.com/512/9922/9922496.png')
											.addFields({ name: 'RR Name', value: result2[0].rr_name , inline: false })
											.addFields({ name: 'RR Reward', value: result2[0].reward , inline: false })
											.addFields({ name: 'Total Points Target', value: '**'+result2[0].nb_points_to_winner+'**' , inline: false })
											.addFields({ name: 'Status', value: stat , inline: false })
											.addFields({ name: 'Raiding Link', value: result[0].raid_link , inline: false })
											.addFields({ name: 'Points Per Like', value: '**' + result[0].points_per_like  + '**', inline: false })
											.addFields({ name: 'Points Per Comment', value: '**' + result[0].points_per_comment  + '**' , inline: false })
											.addFields({ name: 'Points Per Retweet', value: '**' + result[0].points_per_retweet  + '**' , inline: false })
											
											const row = new ActionRowBuilder()
													.addComponents(
														new ButtonBuilder()
															.setCustomId('claimr2ebtn')
															.setLabel('Claim Points')
															.setStyle(ButtonStyle.Success),
													).addComponents(
														new ButtonBuilder()
															.setCustomId('leaderboardbtn')
															.setLabel('RR Leaderboard')
															.setStyle(ButtonStyle.Primary),
													)
													.addComponents(
														new ButtonBuilder()
															.setCustomId('mypointsbtn')
															.setLabel('My Points')
															.setStyle(ButtonStyle.Primary),
													).addComponents(
														new ButtonBuilder()
															.setCustomId('registerbtn')
															.setLabel('Not Registered?')
															.setStyle(ButtonStyle.Primary),
													);

											msg.delete()
											sendMsg(embed1, msg, row)
											})
								}catch(err){

									msg.delete()
									sendErrorMsg(msg);
								}
						}
					})
				}
			});
		}
	}else if(msg.content.includes('!t2e')){
		if(hasRole){
			var sql = "SELECT * from rr_mission where t2e_name = '" + msg.content.replace('!t2e ','') +"' and dc_id = '" + msg.guild.id + "';";

			con.query(sql, async (err, result) => {
				if (err) {
					msg.delete()
					sendErrorMsg(msg);
				}
				else{
					var sql = "SELECT * from raiding_run where rr_id = '" + result[0].rr_id +"';";
					con.query(sql, async (err, result2) => {

						if (err) {
							msg.delete()
							sendErrorMsg(msg);
						}
						else{
							try{
								var stat = "Finished"

								if(result2[0].finished == 0)
									stat = "Running"

									getProject(msg.guild.id).then(async res => {
										let embed1 = null
										console.log(res , ' ******************')
										if(res == null){
											embed1 = embed()
										}else{
											embed1 = embed55(res)
										}
										embed1.setTitle('T2E Mission')
											.setThumbnail('https://cdn-icons-png.flaticon.com/512/2580/2580225.png')
											.addFields({ name: 'RR Name', value: result2[0].rr_name , inline: false })
											.addFields({ name: 'RR Reward', value: result2[0].reward , inline: false })
											.addFields({ name: 'Total Points Target', value: '**'+result2[0].nb_points_to_winner+'**' , inline: false })
											.addFields({ name: 'Status', value: stat , inline: false })
											.addFields({ name: 'Words Must Icluded', value: result[0].words_must_include , inline: false })
											.addFields({ name: 'Hashtags Must Included', value: result[0].hashtags_must_include, inline: false })
											.addFields({ name: 'Reward Points', value: '**' + result[0].points_per_t2e  + '**' , inline: false })
											.addFields({ name: 'T2E Name', value:  result[0].t2e_name , inline: false })

											const row = new ActionRowBuilder()
													.addComponents(
														new ButtonBuilder()
															.setCustomId('claimt2ebtn')
															.setLabel('Claim Points')
															.setStyle(ButtonStyle.Success),
													).addComponents(
														new ButtonBuilder()
															.setCustomId('leaderboardbtn')
															.setLabel('RR Leaderboard')
															.setStyle(ButtonStyle.Primary),
													)
													.addComponents(
														new ButtonBuilder()
															.setCustomId('mypointsbtn')
															.setLabel('My Points')
															.setStyle(ButtonStyle.Primary),
													).addComponents(
														new ButtonBuilder()
															.setCustomId('registerbtn')
															.setLabel('Not Registered?')
															.setStyle(ButtonStyle.Primary),
													);

											msg.delete()
											sendMsg(embed1, msg, row)
									})
								}catch(err){

									msg.delete()
									sendErrorMsg(msg);
								}
						}
					})
				}
			});
		}
	}
})

client.login(token);

const embed = () => {
	return new EmbedBuilder()
							//.setTitle('PPC Bot')
							.setColor("#40444a")
							.setImage("https://pbs.twimg.com/profile_banners/1136618210487361536/1683326122/1500x500")
							/*.setAuthor({ name: 'PPC Bot'
							, iconURL: 'https://bafybeidcylfop5rh4ngipj5s2ziydbyidpeuttw2j3qoioasz2wmv2xfsa.ipfs.w3s.link/Pink%20Logo%20BG%20Removed.png'})*/
							.setFooter({ text: 'FpSweeper | RevengerZ'});
	
}

const embed55 = (res) => {
	return new EmbedBuilder()
		
		.setColor("#40444a")
		.setImage(res.profilecoverlink)
							/*.setAuthor({ name: 'PPC Bot'
							, iconURL: 'https://bafybeidcylfop5rh4ngipj5s2ziydbyidpeuttw2j3qoioasz2wmv2xfsa.ipfs.w3s.link/Pink%20Logo%20BG%20Removed.png'})*/
		.setFooter({ text: 'FpSweeper | RevengerZ'});
	
}

const getProject = async (dcid) => {

	return new Promise((resolve, reject) => {
		var sql = "SELECT * from projects where dc_id = '" + dcid + "';";
		console.log(sql)
		con.query(sql, async (err, result) => {
						if (err) {
							resolve(null)
						}
						else{
							if(result.length != 0) {
								resolve(result[0])
							}
							else resolve(null);
						}
					})
	})
	
}

const interactionReply = async (embed1, interaction, row) => {
	if(row != null)
	{
		if(!interaction.deferred)
			await interaction.deferReply({ ephemeral: true }).catch(err => {});	

		await interaction.editReply({ ephemeral: true, embeds: [embed1], components: [row] })
											.catch(async error => { 

												getProject(interaction.guild.id).then(async res => {
													let embed1 = null
													console.log(res , ' ******************1')
													if(res == null){
														embed1 = embed()
													}else{
														embed1 = embed55(res)
													}
													embed1.setDescription('Error occured ! Please retry again or report the error')
													await interaction.editReply({ ephemeral: true, embeds: [embed1]})
												})
											
											});
	}
		
	else
	{
		if(!interaction.deferred)
			await interaction.deferReply({ ephemeral: true }).catch(err => {});			
		
		await interaction.editReply({ ephemeral: true, embeds: [embed1]})
			.catch(async error => {
				getProject(interaction.guild.id).then(async res => {
					let embed1 = null
					console.log(res , ' ******************')
					if(res == null){
						embed1 = embed()
					}else{
						embed1 = embed55(res)
					}
				embed1.setDescription('Error occured ! Please retry again or report the error')
				await interaction.editReply({ ephemeral: true, embeds: [embed1]})
				})
			});
	}
		
}

const sendMsg = (embed1, msg, row) => {
	if(row != null)
	msg.channel.send({ ephemeral: true, embeds: [embed1], components: [row] })
											.catch(error => { const embed1 = getProject(msg.guild.id).then(async res => {
												let embed1 = null
												console.log(res , ' ******************')
												if(res == null){
													embed1 = embed()
												}else{
													embed1 = embed55(res)
												}
												embed1.setDescription('Error occured ! Please retry again or report the error')
												msg.channel.send({ ephemeral: true, embeds: [embed1]})});
												})
	else
	msg.channel.send({ ephemeral: true, embeds: [embed1]})
								.catch(error => {
									getProject(msg.guild.id).then(async res => {
										let embed1 = null
										console.log(res , ' ******************')
										if(res == null){
											embed1 = embed()
										}else{
											embed1 = embed55(res)
										}
									embed1.setDescription('Error occured ! Please retry again or report the error')
									msg.channel.send({ ephemeral: true, embeds: [embed1]})
									})
								});
}

const sendErrorEmbed = async (interaction) => {
	getProject(interaction.guild.id).then(async res => {
		let embed1 = null
		console.log(res , ' ******************')
		if(res == null){
			embed1 = embed()
		}else{
			embed1 = embed55(res)
		}
		embed1.setDescription('Error occured')
		.setThumbnail('https://cdn-icons-png.flaticon.com/512/2569/2569174.png')
	await interactionReply(embed1, interaction, null);
	})
}

const sendErrorMsg = (msg) => {
	let embed1 = getProject(msg.guild.id).then(async res => {
		let embed1 = null
		console.log(res , ' ******************')
		if(res == null){
			embed1 = embed()
		}else{
			embed1 = embed55(res)
		}
		embed1.setDescription('Error occured')
		.setThumbnail('https://cdn-icons-png.flaticon.com/512/2569/2569174.png')
	sendMsg(embed1, msg, null);
	})
}

const checkUserComment = async (tweetid, usertwitterid) => {
	return new Promise((resolve, reject) => {
	var xmlHttp = new XMLHttpRequest();
	var url = "https://api.twitter.com/2/tweets?ids="+tweetid+"&tweet.fields=author_id,conversation_id,created_at,in_reply_to_user_id,referenced_tweets&expansions=author_id,in_reply_to_user_id,referenced_tweets.id&user.fields=name,username";
	xmlHttp.open( "GET", url ); // false for synchronous request
	xmlHttp.setRequestHeader("Authorization", "Bearer AAAAAAAAAAAAAAAAAAAAAFjJkwEAAAAAlZKCY9f%2FX%2B2aKqYn1Ha5TUtPvok%3Dc5CTN8zI6uuuhg7XG3i2uUpDSV5edhdDmTYhJnUf5GE3cidyvS");
	xmlHttp.send();
	xmlHttp.addEventListener("load", async function() {
		var initialArray = JSON.parse(xmlHttp.response);

		if(initialArray.data){
			//***********************/
			xmlHttp = new XMLHttpRequest();
			const url = "https://api.twitter.com/2/tweets/search/recent?query=conversation_id:"+initialArray.data[0].conversation_id+"&tweet.fields=in_reply_to_user_id,author_id,created_at,conversation_id";
			xmlHttp.open( "GET", url ); // false for synchronous request
			xmlHttp.setRequestHeader("Authorization", "Bearer AAAAAAAAAAAAAAAAAAAAAFjJkwEAAAAAlZKCY9f%2FX%2B2aKqYn1Ha5TUtPvok%3Dc5CTN8zI6uuuhg7XG3i2uUpDSV5edhdDmTYhJnUf5GE3cidyvS");
			xmlHttp.send();
			xmlHttp.addEventListener("load", function() {

			initialArray = JSON.parse(xmlHttp.response);
				if(initialArray.data){
					
					var i = 0;
					while( i<initialArray.data.length)
					{
						if(initialArray.data[i].author_id === usertwitterid)
						{
							resolve(true);
						}
							
						
						i++;
					}
				}
				resolve(false);
			},false);
			/************************/
		}
		else resolve(false);
	},false)
	})
}