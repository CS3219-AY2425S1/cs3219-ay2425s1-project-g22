import axios from "axios";

const BASE_URL = process.env.REACT_APP_USER_SERVICE_BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
});

const userLogin = async (email, password, rememberMe) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const token = response.data.data.accessToken;

    if (rememberMe) {
      localStorage.setItem("accessToken", token);
    } else {
      sessionStorage.setItem("accessToken", token);
    }

    return token;
  } catch (error) {
    console.log(error)
    throw new Error(error.response ? error.response.data.message : "Login failed");
  }
}

const userLogout = () => {
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("accessToken");
}

const getToken = () => {
  return (
    localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
  );
}

const verifyToken = async (token) => {
  try {
    const response = await api.get('/auth/verify-token', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : "Token verification failed");
  }
}

const isUserAdmin = async (token) => {
  try {
    const response = await api.get('/auth/verify-token', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data.isAdmin;
  } catch (error) {
    throw new Error(error.response ? error.response.data.message : "Token verification failed");
  }
}

const createUser = async (username, email, password) => {
  try {
    const response = await api.post('/users', {
      username,
      email,
      password,
    });
    return response.data; // 201 Created
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data; // 200 OK
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const response = await api.get('/users', {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data; // 200 OK
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

const updateUser = async (userId, updatedData) => {
  try {
    const response = await api.patch(`/users/${userId}`, updatedData, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data; // 200 OK
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

const updateUserPrivilege = async (userId, isAdmin) => {
  try {
    const response = await api.patch(`/users/${userId}`, { isAdmin }, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data; // 200 OK
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

const deleteUser = async (userId, token) => {
  try {
    const response = await api.delete(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // 200 OK
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
};

const requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/auth/request-password-reset", {
      email,
    });
    return response.data;
  } catch (error) {
      console.error('Error sending password reset email:', error.response.data);
      throw error;
  }
}

const resetPassword = async (token, newPassword) => {
  try {
    console.log(`Sending request to reset password for token: ${token}`);
    const response = await api.post(`/auth/reset-password/${token}`, {
      newPassword,
    });
    console.log("Password reset response:", response.data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response ? error.response.data.message : "Reset password failed"
    );
  }
}

const getAttemptedQuestions = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/attempts`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data; // 200 OK
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

const addAttemptedQuestion = async (userId, questionId) => {
  try {
    const response = await api.post(`/users/${userId}/attempts`, { questionId }, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data; // 201 Created
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

export { addAttemptedQuestion, userLogin, userLogout, createUser, getUser, getAttemptedQuestions, getAllUsers, getToken, isUserAdmin, updateUser, updateUserPrivilege, deleteUser, verifyToken, resetPassword, requestPasswordReset };