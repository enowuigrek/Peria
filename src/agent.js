import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function askAgent(message) {
  console.log('🔑 API Key:', import.meta.env.VITE_OPENAI_API_KEY);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Jesteś asystentem pomagającym tworzyć listę zadań. Użytkownik pisze wiadomość, a Ty wypisujesz z niej osobne zadania w postaci listy. Każde zadanie podaj w nowej linii, bez numeracji, tylko czysty tekst.'
        },
        {
          role: 'user',
          content: message
        }
      ]
    });

    const reply = response.choices?.[0]?.message?.content || '';
    console.log('📦 Odpowiedź z AI:', reply);

    if (!reply.trim()) {
      console.warn('⚠️ OpenAI returned an empty message.');
      return '[Brak odpowiedzi z AI]';
    }

    return reply.split('\n').filter(t => t.trim() !== '');

  } catch (error) {
    console.error('❌ Błąd OpenAI:', error);
    return '[Błąd po stronie AI]';
  }
}