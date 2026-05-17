const SIZZLE_AI = (() => {

  // 🔑 PASTE YOUR GROQ API KEY HERE
  const GROQ_API_KEY = "YOUR API KEY";

  const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
  const MODEL = "llama-3.1-8b-instant";

  async function askGroq(systemPrompt, userMessage, history = []) {
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: userMessage }
    ];

    let response;
    try {
      response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + GROQ_API_KEY
        },
        body: JSON.stringify({ model: MODEL, max_tokens: 1000, temperature: 0.7, messages })
      });
    } catch (netErr) {
      throw new Error("Network error. Check your internet connection.");
    }

    const raw = await response.text();
    console.log("Groq response:", raw);
    const data = JSON.parse(raw);

    if (data.error) throw new Error("Groq error: " + data.error.message);

    const text = data.choices[0].message.content;
    console.log("Groq reply:", text);
    return text;
  }

  async function suggestRecipe(recipeName, category) {
    const system = `You are a professional chef assistant for SIZZLE recipe app.
Respond ONLY with valid JSON, no markdown, no backticks, no explanation.
Use exactly these keys: "ingredients" and "instructions".
{"ingredients": "comma-separated ingredients with quantities","instructions": "step-by-step instructions as a paragraph"}`;
    const raw   = await askGroq(system, `Recipe: "${recipeName}", Category: "${category}"`);
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    // handle if model returns "title" instead of "name"
    if (parsed.title && !parsed.name) parsed.name = parsed.title;
    return parsed;
  }

  async function chat(history, userMessage) {
    const system = `You are SIZZLE's friendly AI chef assistant. Help with cooking tips, recipe suggestions, substitutions, and food pairing. Be concise and warm. Use emojis occasionally.`;
    return await askGroq(system, userMessage, history);
  }

  async function suggestFromIngredients(ingredients) {
    const system = `You are a creative chef for SIZZLE recipe app.
Suggest ONE complete recipe from the given ingredients.
Respond ONLY with raw JSON, no markdown, no backticks, no explanation.
Use exactly these keys: "name", "category", "ingredients", "instructions".
{"name":"Recipe Name","category":"Main Course","ingredients":"item1, item2","instructions":"Step 1. Step 2."}
Category must be one of: Main Course, Dessert, Appetizer`;
    const raw   = await askGroq(system, `I have: ${ingredients}`);
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (parsed.title && !parsed.name) parsed.name = parsed.title;
    return parsed;
  }

  async function generateTip(category) {
    const system = `You are a professional chef. Give ONE short cooking tip. Plain text only, max 2 sentences, no markdown.`;
    return await askGroq(system, `Category: ${category}`);
  }

  return { suggestRecipe, chat, suggestFromIngredients, generateTip };

})();