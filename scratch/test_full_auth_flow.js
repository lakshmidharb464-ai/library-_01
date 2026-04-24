import axios from 'axios';
import fs from 'fs';

const test = async () => {
  try {
    const email = `test_flow_${Date.now()}@example.com`;
    console.log('--- 1. Registering:', email, '---');
    const registerRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'E2E Test User',
      email: email,
      password: 'Password123!',
      role: 'student', 
      department: 'Computer Science'
    });
    console.log('Registration Success:', registerRes.data);

    // Wait 1.5 seconds for OTP to be written
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Read OTP from file
    const otpContent = fs.readFileSync('c:/project/library__main-main/scratch/latest_otp.txt', 'utf8');
    const otpMatch = otpContent.match(/OTP:\s*(\d+)/);
    const otp = otpMatch ? otpMatch[1] : null;
    
    if (!otp) {
        console.error('Could not parse OTP from file');
        return;
    }
    console.log('Read OTP:', otp);

    console.log('\n--- 2. Verifying OTP ---');
    const verifyRes = await axios.post('http://localhost:5000/api/auth/verify-otp', {
      email: email,
      otp: otp
    });
    console.log('Verification Success:', verifyRes.data);

    console.log('\n--- 3. Testing Login ---');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: email,
      password: 'Password123!'
    });
    console.log('Login Success Data:', loginRes.data);

    const loginCookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0] : '';
    console.log('Login Cookie received:', !!loginCookie);

    console.log('\n--- 4. Testing Protected Route (GET /api/books) ---');
    const booksRes = await axios.get('http://localhost:5000/api/books', {
      headers: {
        'Cookie': loginCookie,
        'Authorization': `Bearer ${loginRes.data.accessToken}`
      }
    });
    console.log(`Protected Route Success: Retrieved ${booksRes.data.length} books`);

    console.log('\n--- 5. Testing Logout ---');
    const logoutRes = await axios.post('http://localhost:5000/api/auth/logout', {}, {
      headers: {
        'Cookie': loginCookie
      }
    });
    console.log('Logout Success:', logoutRes.data);

  } catch (error) {
    console.error('Test Flow Failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
};

test();
