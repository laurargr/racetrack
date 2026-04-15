const receptionist_key = process.env.receptionist_key;
const observer_key = process.env.observer_key;
const safety_key = process.env.safety_key;

export function validations() {
  if (!receptionist_key || !observer_key || !safety_key) {
    console.error("Error: Missing required environment variables. Please export receptionist_key, observer_key, and safety_key.");
    process.exit(1);
}
}

export function handleAuthentication(username, token) {
  if (username === "receptionist" && token === receptionist_key) {
    return true;
  } else if (username === "lap-line-observer" && token === observer_key) {
    return true;
  } else if (username === "safety-officer" && token === safety_key) {
    return true;
  } else if (username === "public") {
    return true;
  }
  return false;
}
