async function execute(message) {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        message.channel.send("nice");
    }
}
module.exports = { execute }