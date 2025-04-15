
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// Bot token and group ID from environment variables or config
const token = process.env.TELEGRAM_BOT_TOKEN;
const groupId = process.env.GROUP_ID;

// Create a new Telegram bot
const bot = new TelegramBot(token, { polling: true });

// Load tasks and users from JSON files
let tasks = require('./tasks.json');
let users = require('./users.json');

// Function to assign tasks
function assignTask(taskName, user) {
    bot.sendMessage(groupId, `@${user} has been assigned the task: ${taskName}`);
    // Update tasks.json with the new assignment
    tasks = tasks.map(task => task.name === taskName ? {...task, assignedTo: user} : task);
    fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
}

// Handle incoming messages
bot.onText(/\/tasks/, (msg) => {
    const chatId = msg.chat.id;
    let taskList = tasks.map(task => \`\${task.name} - Assigned to: \${task.assignedTo || 'None'}\`).join('\n');
    bot.sendMessage(chatId, `Current tasks:\n\${taskList}`);
});

// Start a task manually (initiative-based tasks)
bot.onText(/\/starttask (.+)/, (msg, match) => {
    const taskName = match[1];
    assignTask(taskName, users[0]); // Assign to first user in the rotation
    bot.sendMessage(msg.chat.id, \`Initiative task "\${taskName}" has started.\`);
});
