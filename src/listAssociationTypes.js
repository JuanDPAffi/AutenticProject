// get-convenio-assoc-labels.js
import axios from "axios";
const TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
const TO = "2-24411421"; // Convenios

const main = async () => {
  const { data } = await axios.get(
    `https://api.hubapi.com/crm/v4/associations/notes/${TO}/labels`,
    { headers: { Authorization: `Bearer ${TOKEN}` } }
  );
  console.log(JSON.stringify(data, null, 2));
};
main().catch(console.error);
