async function execute(message) {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 100));
        message.channel.send("hello");
    }
}
module.exports = { execute }