const Discord = require('discord.js');
const client  = new Discord.Client();
const fs      = require('fs');
const config  = JSON.parse(fs.readFileSync('./config.json', 'utf8'))

client.login(config.idBot);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', (member) => {
    //Systeme de kick
    function kick() {
        if (member._roles.includes(config.verif.roleVerif)){
            return
        }else{
            try{
                const configUser  = JSON.parse(fs.readFileSync("./account/"+member.user.id+".json", 'utf8'))

                function one() {
                    client.users.cache.get(member.user.id).send("❌ **| Tu n'as pas rentré le code dans le temps imparti !**")
                }

                function two() {
                    client.guilds.cache.get(config.guild).members.cache.get(member.user.id).kick()
                }

                setTimeout(one, 0)
                setTimeout(two, 150)
            }catch (e) {
                return;
            }
        }
    }

    setTimeout(kick, 900000)


    //Generation de code
    function makeid(length) {
        var result           = [];
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result.push(characters.charAt(Math.floor(Math.random() *
                charactersLength)));
        }
        return result.join('');
    }

    var key = makeid(8)

    //Creation du salon
    client.guilds.cache.get(config.guild).channels.create('「🔒」vérification', {
        type: 'text',
        parent: config.verif.idCategorie,
        permissionOverwrites : [
            {
                id: config.guild,
                deny: ['VIEW_CHANNEL'],
            },

            {
                id: member.user.id,
                allow: ['VIEW_CHANNEL'],
            },
        ],
    }).then(TextChannel => {
        fs.writeFile('./account/'+member.user.id+'.json', "{\"member\": \""+member.user.id+"\", \"channel\": \""+TextChannel.id+"\", \"key\": \""+key+"\"}", function (err) {if(err) throw err;})

        const embed = new Discord.MessageEmbed()
            .setColor('#2aa198')
            .setDescription("Pour accéder au serveur, tu dois taper le code :\n ```yaml\n"+key+"\n```")


        TextChannel.send(embed)
        TextChannel.send("<@"+member.user.id+">").then(msg => msg.delete())
    })
});

client.on('message', (message) => {
    //Verif code
    if (message.channel.parentID === config.verif.idCategorie){
        if (message.author.bot){
            return;
        }else{

            try{
                const configUser = JSON.parse(fs.readFileSync("./account/"+message.author.id+".json", 'utf8'))

                if (message.author.id ===  configUser.member && message.content.toUpperCase() === configUser.key){
                    function addRole() {
                        function one() {
                            client.users.cache.get(message.author.id).send("✅ | Félicitations, tu es vérifié sur `"+client.guilds.cache.get(config.guild).name+"`")
                            client.guilds.cache.get(config.guild).members.cache.get(message.author.id).roles.add(client.guilds.cache.get(config.guild).roles.cache.get(config.verif.roleVerif))
                        }

                        function two() {
                            client.guilds.cache.get(config.guild).channels.cache.get(configUser.channel).delete()
                        }

                        function three() {
                            fs.unlink("./account/"+message.author.id+".json", (err) => {
                                if (err) {
                                    console.error(err)
                                    return
                                }
                            })
                        }

                        setTimeout(one, 0)
                        setTimeout(two, 300)
                        setTimeout(three, 600)
                    }

                    addRole()
                }else{
                    message.delete()
                    message.channel.send("❌ **| Mauvais code, ressayer !**").then(msg => msg.delete({timeout: 3000}))
                }
            }catch (e) {
                return;
            }
        }
    }
});

client.on('guildMemberRemove', (member) => {
    function leave() {
        if (member._roles.includes(config.verif.roleVerif)){
            return
        }else{
            const configUser  = JSON.parse(fs.readFileSync("./account/"+member.user.id+".json", 'utf8'))

            function one() {
                client.guilds.cache.get(config.guild).channels.cache.get(configUser.channel).delete()
            }

            function two() {
                fs.unlink("./account/"+member.user.id+".json", (err) => {
                    if (err) {
                        console.error(err)
                        return
                    }
                })
            }

            setTimeout(one, 150)
            setTimeout(two, 300)
        }
    }

    leave()
});