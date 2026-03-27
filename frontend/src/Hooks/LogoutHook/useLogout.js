import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const response = await axios.post('https://ebaybaymo-server-b084d082cda7.herokuapp.com/auth/logout');
      if (response.status === 200) {
        console.log("Response", response);
        navigate('/Homepage');
      } else {
        console.error('Logout failed:', response.data.error);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return logout;
};

export default useLogout;
