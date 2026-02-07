
const apiKey = process.env.GOOGLE_AI_API_KEY;

async function checkModels() {
  if (!apiKey) {
    console.error("No API key found");
    return;
  }

  const versions = ['v1', 'v1beta'];
  
  for (const v of versions) {
    console.log(`Checking version ${v}...`);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`);
      const data = await response.json();
      if (data.models) {
        console.log(`Available models in ${v}:`, data.models.map(m => m.name));
      } else {
        console.log(`No models found in ${v} or error:`, data);
      }
    } catch (e) {
      console.error(`Failed to fetch ${v}:`, e);
    }
  }
}

checkModels();
