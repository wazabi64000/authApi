// testForceBruteLogin.js
import axios from "axios";

const testLoginBruteForce = async () => {
  const URL = "http://localhost:5000/api/auth/login";

  const payload = {
    email: "wazabi.boy@mail.com",
    password: "wazabi123456"
  };

  for (let i = 1; i <= 60000000; i++) {
    try {
      const response = await axios.post(URL, payload, {
        withCredentials: true,
      });
      console.log(`Tentative ${i}:`, response.data.message);
    } catch (error) {
      if (error.response) {
        console.log(`Tentative ${i}:`, error.response.status, error.response.data.message);
      } else {
        console.error(`Tentative ${i}: Erreur inconnue`, error.message);
      }
    }
  }
};

testLoginBruteForce();
