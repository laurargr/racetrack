const receptionist_key = process.env.receptionist_key;
const observer_key = process.env.observer_key;
const safety_key = process.env.safety_key;

export function validations() {
  if (!receptionist_key) {
    console.error("receptionist_key is not defined");
    process.exit(1);
  } else if (!observer_key) {
    console.error("observer_key is not defined");
    process.exit(1);
  } else if (!observer_key) {
    console.error("safety_key is not defined");
    process.exit(1);
  }
}

export function handleAuthentication(username, token) {
  if (username === "receptionist" && token === receptionist_key) {
    return true;
  } else if (username === "lap-line observer" && token === observer_key) {
    return true;
  } else if (username === "safety-officer" && token === safety_key) {
    return true;
  } else if (username === "public") {
    return true;
  }
  return false;
}
