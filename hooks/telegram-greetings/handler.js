// Telegram Greetings Handler - Ultra Fast
const USER_GREETINGS = {
  '1194411669': (name) => `Hey ${name}! 👋`,
  '8794421716': () => `Hey Sk Alamgir! 👋`
};

async function telegramGreetingsHandler(context) {
  // Fast reject
  if (context.event !== 'message' || context.session?.channel !== 'telegram') {
    return null;
  }
  
  const userId = context.session?.authorId;
  const greetFn = USER_GREETINGS[userId];
  if (!greetFn) return null;
  
  const name = context.session?.firstName || 'there';
  return { type: 'assistant', content: greetFn(name) };
}

module.exports = telegramGreetingsHandler;