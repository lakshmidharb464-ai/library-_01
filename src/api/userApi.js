import axios from "axios";

const USER_API = "http://localhost:5000/api/users";

// CREATE USER (request)
export const createUser = (data) => axios.post(`${USER_API}/create`, data);

// APPROVE USER
export const approveUser = (data) => axios.post(`${USER_API}/approve`, data);

// GET USERS
export const getUsers = () => axios.get(USER_API);